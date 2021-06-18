import { IGatewaySettings, INotificationSettings } from '../models/Application'

export type IAppInfo = {
  address: string
  appId: string
  publicKey: string
}

export type GetApplicationQuery = {
  apps: IAppInfo[]
  chain: string
  createdAt?: Date | number
  updatedAt?: Date | number
  freeTier: boolean
  gatewaySettings: IGatewaySettings
  name: string
  notificationSettings: INotificationSettings
  id: string
  status: string
}
