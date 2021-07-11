import express, { Response, Request } from 'express'
import crypto from 'crypto'
import { GraphQLClient } from 'graphql-request'
import { typeGuard, QueryAppResponse } from '@pokt-network/pocket-js'
import { IAppInfo, GetApplicationQuery } from './types'
import env from '../environment'
import { getSdk } from '../graphql/types'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import Application, { IApplication } from '../models/Application'
import ApplicationPool, { IPreStakedApp } from '../models/PreStakedApp'
import LoadBalancer, { ILoadBalancer } from '../models/LoadBalancer'
import { IUser } from '../models/User'
import {
  composeDaysFromNowUtcDate,
  composeHoursFromNowUtcDate,
  composeTodayUtcDate,
} from '../lib/date-utils'
import { getApp } from '../lib/pocket'
import HttpError from '../errors/http-error'
import MailgunService from '../services/MailgunService'
import { APPLICATION_STATUSES } from '../application-statuses'

const BUCKETS_PER_HOUR = 2
const DEFAULT_GATEWAY_SETTINGS = {
  secretKey: '',
  secretKeyRequired: false,
  whitelistOrigins: [],
  whitelistUserAgents: [],
}
const DEFAULT_TIMEOUT = 2000
const MAX_USER_APPS = 4

const router = express.Router()

router.use(authenticate)

router.get(
  '',
  asyncMiddleware(async (req: Request, res: Response) => {
    const id = (req.user as IUser)._id
    const lbs = await LoadBalancer.find({
      user: id,
    })

    if (!lbs) {
      throw HttpError.NOT_FOUND({
        errors: [
          {
            id: 'NONEXISTENT_APPLICATION',
            message: 'User does not have an active application',
          },
        ],
      })
    }

    const processedLbs = await Promise.all(
      lbs.map(async (lb) => {
        if (!lb.applicationIDs.length) {
          throw HttpError.INTERNAL_SERVER_ERROR({
            errors: [
              {
                id: 'MALFORMED_LB',
                message: 'Malformed load balancer',
              },
            ],
          })
        }

        if (!lb.updatedAt) {
          lb.updatedAt = new Date(Date.now())

          await lb.save()
        }
        const apps: IAppInfo[] = []

        for (const appId of lb.applicationIDs) {
          const app = await Application.findById(appId)

          apps.push({
            appId: app._id.toString(),
            address: app.freeTierApplicationAccount.address,
            publicKey: app.freeTierApplicationAccount.publicKey,
          })
        }

        const app = await Application.findById(lb.applicationIDs[0])

        const processedLb: GetApplicationQuery = {
          apps,
          chain: app.chain,
          createdAt: new Date(Date.now()),
          updatedAt: lb.updatedAt,
          freeTier: app.freeTier,
          gatewaySettings: app.gatewaySettings,
          notificationSettings: app.notificationSettings,
          name: lb.name,
          id: lb._id.toString(),
          status: app.status,
        }

        return processedLb
      })
    )

    res.status(200).send(processedLbs)
  })
)

router.post(
  '',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { name, chain, gatewaySettings = DEFAULT_GATEWAY_SETTINGS } = req.body

    const id = (req.user as IUser)._id
    const userApps = await Application.find({ user: id })
    const isNewAppRequestInvalid = userApps.length >= MAX_USER_APPS

    if (isNewAppRequestInvalid) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'ALREADY_EXISTING',
            message: 'User has reached their free app limit.',
          },
        ],
      })
    }
    const preStakedApp: IPreStakedApp = await ApplicationPool.findOne({
      status: APPLICATION_STATUSES.SWAPPABLE,
      chain,
    })

    if (!preStakedApp) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'POOL_EMPTY',
            message: 'No pre-staked apps available for this chain.',
          },
        ],
      })
    }
    const application = new Application({
      chain,
      name,
      user: id,
      status: APPLICATION_STATUSES.IN_SERVICE,
      lastChangedStatusAt: new Date(Date.now()),
      // We enforce every app to be treated as a free-tier app for now.
      freeTier: true,
      freeTierApplicationAccount: preStakedApp.freeTierApplicationAccount,
      gatewayAAT: preStakedApp.gatewayAAT,
      gatewaySettings: {
        ...gatewaySettings,
      },
      notificationSettings: {
        signedUp: false,
        quarter: false,
        half: false,
        threeQuarters: false,
        full: false,
      },
    })

    application.gatewaySettings.secretKey = crypto
      .randomBytes(16)
      .toString('hex')

    await application.save()

    const { ok } = await ApplicationPool.deleteOne({ _id: preStakedApp._id })

    if (ok !== 1) {
      throw HttpError.INTERNAL_SERVER_ERROR({
        errors: [
          {
            id: 'DB_ERROR',
            message: 'There was an error while updating the DB',
          },
        ],
      })
    }
    const loadBalancer: ILoadBalancer = new LoadBalancer({
      user: id,
      name,
      requestTimeOut: DEFAULT_TIMEOUT,
      applicationIDs: [application._id.toString()],
      updatedAt: new Date(Date.now()),
    })

    await loadBalancer.save()

    const processedLb: GetApplicationQuery = {
      chain: application.chain,
      createdAt: new Date(Date.now()),
      updatedAt: loadBalancer.updatedAt,
      name: loadBalancer.name,
      id: loadBalancer._id.toString(),
      freeTier: true,
      status: application.status,
      apps: [
        {
          appId: application._id.toString(),
          address: application.freeTierApplicationAccount.address,
          publicKey: application.freeTierApplicationAccount.publicKey,
        },
      ],
      gatewaySettings: application.gatewaySettings,
      notificationSettings: application.notificationSettings,
    }

    res.status(200).send(processedLb)
  })
)

router.put(
  '/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { gatewaySettings } = req.body
    const { lbId } = req.params
    const userId = (req.user as IUser)._id

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NONEXISTENT_APPLICATION', message: 'Application not found' },
        ],
      })
    }

    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'Application does not belong to user',
          },
        ],
      })
    }

    const existingSettings = await Promise.all(
      loadBalancer.applicationIDs.map(async function changeSettings(
        applicationId
      ) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        return application.gatewaySettings
      })
    )

    const { secretKey = '' } = existingSettings.find(
      (settings) => settings?.secretKey !== ''
    )

    gatewaySettings.secretKey = secretKey

    await Promise.all(
      loadBalancer.applicationIDs.map(async function changeSettings(
        applicationId
      ) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        application.gatewaySettings = gatewaySettings
        await application.save()
      })
    )

    res.status(204).send()
  })
)

router.get(
  '/status/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params
    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NONEXISTENT_APPLICATION', message: 'Application not found' },
        ],
      })
    }

    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'Application does not belong to user',
          },
        ],
      })
    }

    const apps = await Promise.all(
      loadBalancer.applicationIDs.map(async function getApps(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        return await getApp(application.freeTierApplicationAccount.address)
      })
    )

    const isAppResponseOk = apps.reduce(
      (ok, app) => ok || typeGuard(app, QueryAppResponse),
      true
    )

    if (!isAppResponseOk) {
      throw HttpError.INTERNAL_SERVER_ERROR({
        errors: [
          {
            id: 'POCKET_JS_ERROR',
            message: 'Application could not be fetched.',
          },
        ],
      })
    }

    const readableApps = apps.map((app: QueryAppResponse) => app.toJSON())

    console.log('appResponses', readableApps)

    const appsStatus = readableApps.reduce(
      (status, app) => {
        return {
          stake: app.staked_tokens + status.stake,
          relays: app.max_relays + status.relays,
        }
      },
      {
        stake: 0,
        relays: 0,
      }
    )

    res.status(200).send(appsStatus)
  })
)

router.put(
  '/notifications/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params
    const { quarter, half, threeQuarters, full } = req.body
    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NONEXISTENT_APPLICATION', message: 'Application not found' },
        ],
      })
    }

    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'Application does not belong to user',
          },
        ],
      })
    }
    const emailService = new MailgunService()
    const hasOptedOut = !(quarter || half || threeQuarters || full)

    const notificationSettings = {
      signedUp: hasOptedOut ? false : true,
      quarter,
      half,
      threeQuarters,
      full,
    }

    await Promise.all(
      loadBalancer.applicationIDs.map(async (id) => {
        const app = await Application.findById(id)

        app.notificationSettings = notificationSettings

        await app.save()
      })
    )

    emailService.send({
      templateName: 'NotificationChange',
      toEmail: (req.user as IUser).email,
    })

    return res.status(204).send()
  })
)

router.post(
  '/switch/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { chain } = req.body
    const { lbId } = req.params
    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    const appsInPool = await ApplicationPool.find({
      chain,
      status: APPLICATION_STATUSES.SWAPPABLE,
    })

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NONEXISTENT_APPLICATION', message: 'Application not found' },
        ],
      })
    }

    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'Application does not belong to user',
          },
        ],
      })
    }

    if (loadBalancer.applicationIDs.length > appsInPool.length) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'TOO_MANY_APPS',
            message: 'Too many applications in Load Balancer',
          },
        ],
      })
    }

    const newApps = await Promise.all(
      loadBalancer.applicationIDs.map(async function switchApp(applicationId) {
        const replacementApplication: IPreStakedApp = appsInPool.pop()

        if (!replacementApplication) {
          throw new Error('No application for the selected chain is available')
        }
        const oldApplication: IApplication = await Application.findById(
          applicationId
        )

        if (!oldApplication) {
          throw new Error('Cannot find application')
        }
        if (
          oldApplication.user.toString() !== (req.user as IUser)._id.toString()
        ) {
          throw HttpError.FORBIDDEN({
            errors: [
              {
                id: 'FOREIGN_APPLICATION',
                message: 'Application does not belong to user',
              },
            ],
          })
        }

        oldApplication.status = APPLICATION_STATUSES.AWAITING_GRACE_PERIOD
        oldApplication.lastChangedStatusAt = Date.now()
        await oldApplication.save()
        // Create a new Application for the user and copy the previous user config
        const newReplacementApplication = new Application({
          // As we're moving to a new chain, everything related to the account and gateway AAT
          // information will change, so we use all the data from the application that we took
          // from the pool.
          chain: replacementApplication.chain,
          freeTierApplicationAccount:
            replacementApplication.freeTierApplicationAccount,
          gatewayAAT: replacementApplication.gatewayAAT,
          status: APPLICATION_STATUSES.IN_SERVICE,
          lastChangedStatusAt: Date.now(),
          freeTier: true,
          // We wanna preserve user-related configuration fields, so we just copy them over
          // from the old application.
          name: oldApplication.name,
          user: oldApplication.user,
          gatewaySettings: oldApplication.gatewaySettings,
        })

        await newReplacementApplication.save()

        return {
          appId: newReplacementApplication._id.toString(),
          address: newReplacementApplication.freeTierApplicationAccount.address,
          publicKey:
            newReplacementApplication.freeTierApplicationAccount.publicKey,
        }
      })
    )

    loadBalancer.applicationIDs = newApps.map((app) => app.appId)
    loadBalancer.updatedAt = new Date(Date.now())

    await loadBalancer.save()
    const newestApp = await Application.findById(loadBalancer.applicationIDs[0])

    const processedLb: GetApplicationQuery = {
      chain: newestApp.chain,
      name: loadBalancer.name,
      apps: newApps,
      createdAt: loadBalancer.createdAt,
      updatedAt: loadBalancer.updatedAt,
      freeTier: true,
      id: loadBalancer._id.toString(),
      gatewaySettings: newestApp.gatewaySettings,
      notificationSettings: newestApp.notificationSettings,
      status: newestApp.status,
    }

    res.status(200).send(processedLb)
  })
)

router.get(
  '/total-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const twentyFoursHoursAgo = composeHoursFromNowUtcDate(24)
    const now = composeHoursFromNowUtcDate(0)

    const totalRelaysAndLatency = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalAppRelays({
          _apk: application.freeTierApplicationAccount.publicKey,
          _gte: twentyFoursHoursAgo,
          _lte: now,
        })

        return {
          total_relays: result.relay_aggregate.aggregate.count ?? 0,
        }
      })
    )

    const cumulativeRelaysAndLatency = totalRelaysAndLatency.reduce(
      function processResults(prev, cur) {
        return {
          total_relays: prev.total_relays + cur.total_relays,
        }
      }
    )

    const processedRelaysAndLatency = {
      total_relays: cumulativeRelaysAndLatency.total_relays,
    }

    res.status(200).send(processedRelaysAndLatency)
  })
)

router.get(
  '/successful-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const twentyFoursHoursAgo = composeHoursFromNowUtcDate(24)
    const now = composeHoursFromNowUtcDate(0)

    const totalRelaysAndLatency = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getSuccessfulAppRelays({
          _apk: application.freeTierApplicationAccount.publicKey,
          _gte: twentyFoursHoursAgo,
          _lte: now,
        })

        return {
          total_relays: result.relay_aggregate.aggregate.count ?? 0,
        }
      })
    )

    const cumulativeRelaysAndLatency = totalRelaysAndLatency.reduce(
      function processResults(prev, cur) {
        return {
          total_relays: prev.total_relays + cur.total_relays,
        }
      },
      {
        total_relays: 0,
      }
    )

    const processedRelaysAndLatency = {
      total_relays: cumulativeRelaysAndLatency.total_relays,
    }

    res.status(200).send(processedRelaysAndLatency)
  })
)

router.get(
  '/daily-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)
    const dailyRelays = new Map()

    await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getDailyTotalRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: sevenDaysAgo,
        })

        for (const {
          bucket,
          total_relays: dailyRelayCount,
        } of result.relay_apps_daily) {
          if (!dailyRelays.has(bucket)) {
            dailyRelays.set(bucket, dailyRelayCount ?? 0)
          } else {
            const currentCount = dailyRelays.get(bucket)

            dailyRelays.set(
              bucket,
              Number(currentCount) + Number(dailyRelayCount)
            )
          }
        }
      })
    )

    const processedDailyRelays = []

    for (const [bucket, dailyRelayCount] of dailyRelays.entries()) {
      processedDailyRelays.push({ bucket, dailyRelays: dailyRelayCount })
    }

    res.status(200).send({
      daily_relays: processedDailyRelays.reverse(),
    })
  })
)

router.get(
  '/session-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const today = composeTodayUtcDate()

    const sessionRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getLastSessionAppRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: today,
          _buckets: BUCKETS_PER_HOUR,
        })

        const totalSessionRelays = result.relay_app_hourly.reduce(
          (total, { total_relays: totalRelays }) => total + totalRelays,
          0
        )

        return totalSessionRelays
      })
    )

    const totalSessionRelays = sessionRelaysPerApp.reduce(function sumRelays(
      total,
      sessionRelays
    ) {
      return total + sessionRelays
    },
    0)

    res.status(200).send({
      session_relays: totalSessionRelays,
    })
  })
)

router.post(
  '/latest-relays',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { id, limit, offset } = req.body

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(id)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const latestRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getLatestRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          limit,
          offset,
        })

        return result
      })
    )

    const relays = []

    latestRelaysPerApp.map((relayBatch) => {
      for (const relay of relayBatch.relay) {
        relays.push(relay)
      }
    })

    relays
      .sort((a, b) => {
        const dateA = new Date(a.timestamp)
        const dateB = new Date(b.timestamp)

        // @ts-ignore
        return dateA - dateB
      })
      .reverse()

    res.status(200).send({
      session_relays: relays.slice(0, 10),
    })
  })
)

router.post(
  '/latest-successful-relays',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id

    const { id, limit, offset } = req.body

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(id)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const latestRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getLatestSuccessfulRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _eq1: 200,
          offset,
        })

        return result
      })
    )

    const relays = []

    latestRelaysPerApp.map((relayBatch) => {
      for (const relay of relayBatch.relay) {
        relays.push(relay)
      }
    })

    relays
      .sort((a, b) => {
        const dateA = new Date(a.timestamp)
        const dateB = new Date(b.timestamp)

        // @ts-ignore
        return dateA - dateB
      })
      .reverse()

    res.status(200).send({
      session_relays: relays.slice(0, 10),
    })
  })
)

router.post(
  '/latest-failing-relays',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { id, limit, offset } = req.body

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(id)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const twentyFourHoursAgo = composeHoursFromNowUtcDate(2)

    const latestRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getLatestFailingRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _eq1: 200,
          // @ts-ignore
          _gte: twentyFourHoursAgo,
          offset,
        })

        return result
      })
    )

    const relays = []

    latestRelaysPerApp.map((relayBatch) => {
      for (const relay of relayBatch.relay) {
        relays.push(relay)
      }
    })

    relays
      .sort((a, b) => {
        const dateA = new Date(a.timestamp)
        const dateB = new Date(b.timestamp)

        // @ts-ignore
        return dateA - dateB
      })
      .reverse()

    res.status(200).send({
      session_relays: relays.slice(0, 10),
    })
  })
)

router.get(
  '/ranged-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const fourtyEightHoursAgo = composeHoursFromNowUtcDate(48)
    const twentyFourHoursAgo = composeHoursFromNowUtcDate(24)

    const previousSuccessfulRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalAppRelays({
          _apk: application.freeTierApplicationAccount.publicKey,
          _gte: fourtyEightHoursAgo,
          _lte: twentyFourHoursAgo,
        })

        return {
          total_relays: result.relay_aggregate.aggregate.count ?? 0,
        }
      })
    )

    const totalRangedRelays = previousSuccessfulRelaysPerApp.reduce(
      function sumRelays(total, app): number {
        return total + app.total_relays
      },
      0
    )

    res.status(200).send({
      total_relays: totalRangedRelays,
    })
  })
)

router.get(
  '/previous-successful-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const fourtyEightHoursAgo = composeHoursFromNowUtcDate(48)
    const twentyFourHoursAgo = composeHoursFromNowUtcDate(24)

    const previousSuccessfulRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getSuccessfulAppRelays({
          _apk: application.freeTierApplicationAccount.publicKey,
          _gte: fourtyEightHoursAgo,
          _lte: twentyFourHoursAgo,
        })

        return {
          successful_relays: result.relay_aggregate.aggregate.count ?? 0,
        }
      })
    )

    const totalSuccessfulRelays = previousSuccessfulRelaysPerApp.reduce(
      function sumRelays(total, app) {
        return total + app.successful_relays
      },
      0
    )

    res.status(200).send({
      successful_relays: totalSuccessfulRelays,
    })
  })
)

router.get(
  '/hourly-latency/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { lbId } = req.params

    const loadBalancer: ILoadBalancer = await LoadBalancer.findById(lbId)

    if (!loadBalancer) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (loadBalancer.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const appIds = loadBalancer.applicationIDs

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const aDayAgo = composeHoursFromNowUtcDate(24)
    const hourlyLatency = new Map()

    await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalRelayDuration({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: aDayAgo,
        })

        for (const {
          bucket,
          elapsed_time: elapsedTime,
        } of result.relay_app_hourly) {
          if (!hourlyLatency.has(bucket)) {
            hourlyLatency.set(bucket, elapsedTime ?? 0)
          } else {
            const currentCount = hourlyLatency.get(bucket)

            hourlyLatency.set(
              bucket,
              (Number(currentCount) + Number(elapsedTime)) / 2
            )
          }
        }
      })
    )

    const processedHourlyLatency = []

    for (const [bucket, hourlyLatencyAvg] of hourlyLatency.entries()) {
      processedHourlyLatency.push({ bucket, latency: hourlyLatencyAvg })
    }

    res.status(200).send({
      hourly_latency: processedHourlyLatency.reverse(),
    })
  })
)

export default router
