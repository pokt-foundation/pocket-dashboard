import express, { Response, Request, NextFunction } from 'express'
import crypto from 'crypto'
import { GraphQLClient } from 'graphql-request'
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

const DEFAULT_GATEWAY_SETTINGS = {
  secretKey: '',
  secretKeyRequired: false,
  whitelistOrigins: [],
  whitelistUserAgents: [],
}
const DEFAULT_TIMEOUT = 2000
const BUCKETS_PER_HOUR = 2
const MAX_LB_SWITCH_THRESHOLD = 2

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

    res.status(200).send(lbs)
  })
)

router.post(
  '',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { name, chain, gatewaySettings = DEFAULT_GATEWAY_SETTINGS } = req.body

    try {
      const id = (req.user as IUser)._id
      const isNewAppRequestInvalid = await Application.exists({
        status: APPLICATION_STATUSES.READY,
        user: id,
      })

      if (isNewAppRequestInvalid) {
        throw HttpError.BAD_REQUEST({
          errors: [
            {
              id: 'ALREADY_EXISTING',
              message: 'User already has an existing free tier app',
            },
          ],
        })
      }
      const preStakedApp: IPreStakedApp = await ApplicationPool.findOne({
        status: APPLICATION_STATUSES.READY,
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
        status: APPLICATION_STATUSES.READY,
        lastChangedStatusAt: new Date(Date.now()),
        // We enforce every app to be treated as a free-tier app for now.
        freeTier: true,
        freeTierApplicationAccount: preStakedApp.freeTierApplicationAccount,
        gatewayAAT: preStakedApp.gatewayAAT,
        gatewaySettings: {
          ...gatewaySettings,
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
      const loadBalancer = new LoadBalancer({
        user: id,
        name,
        requestTimeOut: DEFAULT_TIMEOUT,
        applicationIDs: [application._id.toString()],
      })

      await loadBalancer.save()

      res.status(200).send(application)
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err)
    }
  })
)

router.put(
  '/:lbId',
  asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { gatewaySettings } = req.body
    const { lbId } = req.params
    const userId = (req.user as IUser)._id

    try {
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
    } catch (err) {
      next(err)
    }
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

    res.status(200).send(apps)
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
    const isSignedUp = (loadBalancer as ILoadBalancer).notificationSettings
      .signedUp
    const hasOptedOut = !(quarter || half || threeQuarters || full)

    ;(loadBalancer as ILoadBalancer).notificationSettings = {
      signedUp: hasOptedOut ? false : true,
      quarter,
      half,
      threeQuarters,
      full,
    }
    await loadBalancer.save()
    if (!isSignedUp) {
      emailService.send({
        templateName: 'NotificationSignup',
        toEmail: (req.user as IUser).email,
      })
    } else {
      emailService.send({
        templateName: 'NotificationChange',
        toEmail: (req.user as IUser).email,
      })
    }
    return res.status(204).send()
  })
)

router.post(
  '/switch/:lbId',
  asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser)._id
    const { chain } = req.body
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

    if (loadBalancer.applicationIDs.length > MAX_LB_SWITCH_THRESHOLD) {
      next(
        HttpError.BAD_REQUEST({
          errors: [
            {
              id: 'TOO_MANY_APPS',
              message: 'Too many applications in Load Balancer',
            },
          ],
        })
      )
    }

    const newAppIds = await Promise.all(
      loadBalancer.applicationIDs.map(async function switchApp(applicationId) {
        const replacementApplication: IPreStakedApp = await ApplicationPool.findOne(
          {
            chain,
            status: APPLICATION_STATUSES.READY,
          }
        )

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
          status: APPLICATION_STATUSES.READY,
          lastChangedStatusAt: Date.now(),
          freeTier: true,
          // We wanna preserve user-related configuration fields, so we just copy them over
          // from the old application.
          name: oldApplication.name,
          user: oldApplication.user,
          gatewaySettings: oldApplication.gatewaySettings,
        })

        await newReplacementApplication.save()

        return newReplacementApplication._id.toString()
      })
    )

    loadBalancer.applicationIDs = newAppIds

    await loadBalancer.save()

    try {
      res.status(200).send(loadBalancer)
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err)
    }
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

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const totalRelaysAndLatency = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalRelaysAndLatency({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: sevenDaysAgo,
        })

        return {
          total_relays:
            result.relay_apps_daily_aggregate.aggregate.sum.total_relays,
          elapsed_time:
            result.relay_apps_daily_aggregate.aggregate.avg.elapsed_time,
        }
      })
    )

    const cumulativeRelaysAndLatency = totalRelaysAndLatency.reduce(
      function processResults(prev, cur) {
        return {
          total_relays: prev.total_relays + cur.total_relays,
          elapsed_time: prev.elapsed_time + cur.elapsed_time,
        }
      }
    )

    const processedRelaysAndLatency = {
      total_relays: cumulativeRelaysAndLatency.total_relays,
      elapsed_time: cumulativeRelaysAndLatency.elapsed_time / appIds.length,
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

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const totalRelaysAndLatency = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalSuccessfulRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: sevenDaysAgo,
        })

        return {
          total_relays:
            result.relay_apps_daily_aggregate.aggregate.sum.total_relays,
          elapsed_time:
            result.relay_apps_daily_aggregate.aggregate.avg.elapsed_time,
        }
      })
    )

    const cumulativeRelaysAndLatency = totalRelaysAndLatency.reduce(
      function processResults(prev, cur) {
        return {
          total_relays: prev.total_relays + cur.total_relays,
          elapsed_time: prev.elapsed_time + cur.elapsed_time,
        }
      }
    )

    const processedRelaysAndLatency = {
      total_relays: cumulativeRelaysAndLatency.total_relays,
      elapsed_time: cumulativeRelaysAndLatency.elapsed_time / appIds.length,
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
            dailyRelays.set(bucket, dailyRelayCount)
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

router.get(
  '/latest-relays/:lbId',
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

    const fourteenDaysAgo = composeDaysFromNowUtcDate(14)
    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const previousSuccessfulRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalSuccessfulRangedRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: fourteenDaysAgo,
          _lte: sevenDaysAgo,
        })

        return {
          successful_relays:
            result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
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
  '/-successful-relays/:lbId',
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

    const fourteenDaysAgo = composeDaysFromNowUtcDate(14)
    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const previousSuccessfulRelaysPerApp = await Promise.all(
      appIds.map(async function getData(applicationId) {
        const application: IApplication = await Application.findById(
          applicationId
        )

        const result = await gqlClient.getTotalSuccessfulRangedRelays({
          _eq: application.freeTierApplicationAccount.publicKey,
          _gte: fourteenDaysAgo,
          _lte: sevenDaysAgo,
        })

        return {
          successful_relays:
            result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
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
            hourlyLatency.set(bucket, elapsedTime)
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
