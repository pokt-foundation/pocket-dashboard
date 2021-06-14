import express, { Response, Request } from 'express'
import { GraphQLClient } from 'graphql-request'
import env from '../environment'
import { getSdk } from '../graphql/types'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import Application, { IApplication } from '../models/Application'
import LoadBalancer, { ILoadBalancer } from '../models/LoadBalancer'
import { IUser } from '../models/User'
import {
  composeDaysFromNowUtcDate,
  composeHoursFromNowUtcDate,
  composeTodayUtcDate,
} from '../lib/date-utils'
import HttpError from '../errors/http-error'

const BUCKETS_PER_HOUR = 2

const router = express.Router()

router.use(authenticate)

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
