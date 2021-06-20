import express, { Response, Request } from 'express'
import { GraphQLClient } from 'graphql-request'
import { typeGuard, QueryAppResponse } from '@pokt-network/pocket-js'
import { GetApplicationQuery } from './types'
import env from '../environment'
import { getSdk } from '../graphql/types'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import Application, { IApplication } from '../models/Application'
import ApplicationPool, { IPreStakedApp } from '../models/PreStakedApp'
import { IUser } from '../models/User'
import {
  composeDaysFromNowUtcDate,
  composeHoursFromNowUtcDate,
  composeTodayUtcDate,
} from '../lib/date-utils'
import HttpError from '../errors/http-error'
import MailgunService from '../services/MailgunService'
import { getApp } from '../lib/pocket'
import { APPLICATION_STATUSES } from '../application-statuses'

const BUCKETS_PER_HOUR = 2

const router = express.Router()

router.use(authenticate)

router.get(
  '',
  asyncMiddleware(async (req: Request, res: Response) => {
    const id = (req.user as IUser)._id
    const application = await Application.find({
      status: APPLICATION_STATUSES.READY,
      user: id,
    })

    if (!application) {
      throw HttpError.NOT_FOUND({
        errors: [
          {
            id: 'NONEXISTENT_APPLICATION',
            message: 'User does not have an active application',
          },
        ],
      })
    }

    application.map((application) => {
      if (application.user.toString() !== id.toString()) {
        throw HttpError.FORBIDDEN({
          errors: [
            {
              id: 'UNAUTHORIZED_ACCESS',
              message: 'User does not have access to this application',
            },
          ],
        })
      }
    })

    await Promise.all(
      application.map(async (application) => {
        if (!application.updatedAt) {
          application.updatedAt = new Date(Date.now())
          await application.save()
        }
      })
    )

    const processedApplications = application.map(
      (app): GetApplicationQuery => ({
        apps: [
          {
            address: app.freeTierApplicationAccount.address,
            appId: app._id.toString(),
            publicKey: app.freeTierApplicationAccount.publicKey,
          },
        ],
        chain: app.chain,
        freeTier: app.freeTier,
        gatewaySettings: app.gatewaySettings,
        notificationSettings: app.notificationSettings,
        name: app.name,
        id: app._id.toString(),
        status: app.status,
        updatedAt: app.updatedAt,
      })
    )

    res.status(200).send(processedApplications)
  })
)

router.get(
  '/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params
    const application: IApplication = await Application.findById(applicationId)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_APPLICATION',
            message: 'User does not have an active application',
          },
        ],
      })
    }

    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

    if (!application.updatedAt) {
      application.updatedAt = new Date(Date.now())
      await application.save()
    }

    const processedApplication: GetApplicationQuery = {
      apps: [
        {
          address: application.freeTierApplicationAccount.address,
          appId: application._id.toString(),
          publicKey: application.freeTierApplicationAccount.publicKey,
        },
      ],
      chain: application.chain,
      freeTier: application.freeTier,
      gatewaySettings: application.gatewaySettings,
      name: application.name,
      notificationSettings: application.notificationSettings,
      id: application._id.toString(),
      status: application.status,
      updatedAt: application.updatedAt,
    }

    res.status(200).send(processedApplication)
  })
)

router.get(
  '/status/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params
    const application: IApplication = await Application.findById(applicationId)

    if (!application) {
      throw HttpError.NOT_FOUND({
        errors: [
          {
            id: 'NONEXISTENT_APPLICATION',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }
    const app = await getApp(application.freeTierApplicationAccount.address)

    if (!typeGuard(app, QueryAppResponse)) {
      throw HttpError.INTERNAL_SERVER_ERROR({
        errors: [
          {
            id: 'POCKET_JS_ERROR',
            message: 'Application could not be fetched.',
          },
        ],
      })
    }

    const readableApp = app.toJSON()

    res.status(200).send({
      stake: readableApp.staked_tokens,
      relays: readableApp.max_relays,
    })
  })
)

router.put(
  '/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { gatewaySettings } = req.body
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NONEXISTENT_APPLICATION', message: 'Application not found' },
        ],
      })
    }
    const userId = (req.user as IUser)._id

    if (application.user.toString() !== userId.toString()) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'Application does not belong to user',
          },
        ],
      })
    }
    application.gatewaySettings = gatewaySettings
    await application.save()
    // lodash's merge mutates the target object passed in.
    // This is what we want, as we don't want to lose any of the mongoose functionality
    // while at the same time updating the model itself
    res.status(204).send()
  })
)

router.post(
  '/switch/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { chain } = req.body
    const { applicationId } = req.params

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
    if (oldApplication.user.toString() !== (req.user as IUser)._id.toString()) {
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
      updatedAt: new Date(Date.now()),
      // We wanna preserve user-related configuration fields, so we just copy them over
      // from the old application.
      name: oldApplication.name,
      user: oldApplication.user,
      gatewaySettings: oldApplication.gatewaySettings,
    })

    await newReplacementApplication.save()

    const processedApplication: GetApplicationQuery = {
      chain: newReplacementApplication.chain,
      name: newReplacementApplication.name,
      apps: [
        {
          address: newReplacementApplication.freeTierApplicationAccount.address,
          appId: newReplacementApplication._id.toString(),
          publicKey:
            newReplacementApplication.freeTierApplicationAccount.publicKey,
        },
      ],
      freeTier: newReplacementApplication.freeTier,
      gatewaySettings: newReplacementApplication.gatewaySettings,
      notificationSettings: newReplacementApplication.notificationSettings,
      id: newReplacementApplication._id.toString(),
      status: newReplacementApplication.status,
      updatedAt: newReplacementApplication.updatedAt,
    }

    res.status(200).send(processedApplication)
  })
)

router.put(
  '/notifications/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { applicationId } = req.params
    const { quarter, half, threeQuarters, full } = req.body
    const application = await Application.findById(applicationId)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_APPLICATION',
            message: 'This application does not exist',
          },
        ],
      })
    }
    if (
      (application as IApplication).user.toString() !==
      (req.user as IUser)._id.toString()
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

    const emailService = new MailgunService()
    const isSignedUp = (application as IApplication).notificationSettings
      .signedUp
    const hasOptedOut = !(quarter || half || threeQuarters || full)

    ;(application as IApplication).notificationSettings = {
      signedUp: hasOptedOut ? false : true,
      quarter,
      half,
      threeQuarters,
      full,
    }
    await application.save()
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

router.get(
  '/total-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active Load Balancer',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const result = await gqlClient.getTotalRelaysAndLatency({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: sevenDaysAgo,
    })

    const processedRelaysAndLatency = {
      total_relays:
        result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
      elapsed_time:
        result.relay_apps_daily_aggregate.aggregate.avg.elapsed_time ?? 0,
    }

    res.status(200).send(processedRelaysAndLatency)
  })
)

router.get(
  '/successful-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const result = await gqlClient.getTotalSuccessfulRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: sevenDaysAgo,
    })

    const processedRelaysAndLatency = {
      total_relays:
        result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
      elapsed_time:
        result.relay_apps_daily_aggregate.aggregate.avg.elapsed_time ?? 0,
    }

    res.status(200).send(processedRelaysAndLatency)
  })
)

router.get(
  '/daily-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(7)

    const result = await gqlClient.getDailyTotalRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: sevenDaysAgo,
    })

    const dailyRelays = new Map()

    for (const {
      bucket,
      total_relays: dailyRelayCount,
    } of result.relay_apps_daily) {
      if (!dailyRelays.has(bucket)) {
        dailyRelays.set(bucket, dailyRelayCount ?? 0)
      } else {
        const currentCount = dailyRelays.get(bucket)

        dailyRelays.set(bucket, Number(currentCount) + Number(dailyRelayCount))
      }
    }

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
  '/session-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const today = composeTodayUtcDate()

    const result = await gqlClient.getLastSessionAppRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: today,
      _buckets: BUCKETS_PER_HOUR,
    })

    const totalSessionRelays = result.relay_app_hourly.reduce(
      (total, { total_relays: totalRelays }) => total + totalRelays,
      0
    )

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

    const application: IApplication = await Application.findById(id)

    if (!id) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const result = await gqlClient.getLatestRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      limit,
      offset,
    })

    const relays = result.relay

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

    const application: IApplication = await Application.findById(id)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const latestSuccessfulRelays = await gqlClient.getLatestSuccessfulRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _eq1: 200,
      offset,
    })

    const relays = []

    latestSuccessfulRelays.relay.map((relayBatch) => {
      relays.push(relayBatch)
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

    const { id, offset } = req.body

    const application: IApplication = await Application.findById(id)

    if (!application) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this load balancer',
          },
        ],
      })
    }

    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const latestSuccessfulRelays = await gqlClient.getLatestFailingRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _eq1: 200,
      offset,
    })

    const relays = []

    latestSuccessfulRelays.relay.map((relayBatch) => {
      relays.push(relayBatch)
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
  '/ranged-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

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

    const result = await gqlClient.getTotalRangedRelaysAndLatency({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: fourteenDaysAgo,
      _lte: sevenDaysAgo,
    })

    const totalRangedRelays = {
      total_relays:
        result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
    }

    res.status(200).send({
      total_relays: totalRangedRelays.total_relays,
    })
  })
)

router.get(
  '/previous-successful-relays/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

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

    const result = await gqlClient.getTotalSuccessfulRangedRelays({
      _eq: application.freeTierApplicationAccount.publicKey,
      _gte: fourteenDaysAgo,
      _lte: sevenDaysAgo,
    })

    const totalSuccessfulRelays = {
      successful_relays:
        result.relay_apps_daily_aggregate.aggregate.sum.total_relays ?? 0,
    }

    res.status(200).send({
      successful_relays: totalSuccessfulRelays.successful_relays,
    })
  })
)

router.get(
  '/hourly-latency/:applicationId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id
    const { applicationId } = req.params

    const application: IApplication = await Application.findById(applicationId)

    if (!applicationId) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NONEXISTENT_LOADBALANCER',
            message: 'User does not have an active application',
          },
        ],
      })
    }
    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [
          {
            id: 'UNAUTHORIZED_ACCESS',
            message: 'User does not have access to this application',
          },
        ],
      })
    }

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
