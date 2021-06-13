import gql from 'graphql-tag'
import { GraphQLClient } from 'graphql-request'
import * as Dom from 'graphql-request/dist/types.dom'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  bigint: any
  float8: any
  numeric: any
  timestamptz: any
}

/** expression to compare columns of type String. All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: Maybe<Scalars['String']>
  _gt?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['String']>
  _ilike?: Maybe<Scalars['String']>
  _in?: Maybe<Array<Scalars['String']>>
  _is_null?: Maybe<Scalars['Boolean']>
  _like?: Maybe<Scalars['String']>
  _lt?: Maybe<Scalars['String']>
  _lte?: Maybe<Scalars['String']>
  _neq?: Maybe<Scalars['String']>
  _nilike?: Maybe<Scalars['String']>
  _nin?: Maybe<Array<Scalars['String']>>
  _nlike?: Maybe<Scalars['String']>
  _nsimilar?: Maybe<Scalars['String']>
  _similar?: Maybe<Scalars['String']>
}

/** expression to compare columns of type bigint. All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: Maybe<Scalars['bigint']>
  _gt?: Maybe<Scalars['bigint']>
  _gte?: Maybe<Scalars['bigint']>
  _in?: Maybe<Array<Scalars['bigint']>>
  _is_null?: Maybe<Scalars['Boolean']>
  _lt?: Maybe<Scalars['bigint']>
  _lte?: Maybe<Scalars['bigint']>
  _neq?: Maybe<Scalars['bigint']>
  _nin?: Maybe<Array<Scalars['bigint']>>
}

/** expression to compare columns of type float8. All fields are combined with logical 'AND'. */
export type Float8_Comparison_Exp = {
  _eq?: Maybe<Scalars['float8']>
  _gt?: Maybe<Scalars['float8']>
  _gte?: Maybe<Scalars['float8']>
  _in?: Maybe<Array<Scalars['float8']>>
  _is_null?: Maybe<Scalars['Boolean']>
  _lt?: Maybe<Scalars['float8']>
  _lte?: Maybe<Scalars['float8']>
  _neq?: Maybe<Scalars['float8']>
  _nin?: Maybe<Array<Scalars['float8']>>
}

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root'
  /** delete data from the table: "relay" */
  delete_relay?: Maybe<Relay_Mutation_Response>
  /** insert data into the table: "relay" */
  insert_relay?: Maybe<Relay_Mutation_Response>
  /** insert a single row into the table: "relay" */
  insert_relay_one?: Maybe<Relay>
  /** update data of the table: "relay" */
  update_relay?: Maybe<Relay_Mutation_Response>
}

/** mutation root */
export type Mutation_RootDelete_RelayArgs = {
  where: Relay_Bool_Exp
}

/** mutation root */
export type Mutation_RootInsert_RelayArgs = {
  objects: Array<Relay_Insert_Input>
}

/** mutation root */
export type Mutation_RootInsert_Relay_OneArgs = {
  object: Relay_Insert_Input
}

/** mutation root */
export type Mutation_RootUpdate_RelayArgs = {
  _inc?: Maybe<Relay_Inc_Input>
  _set?: Maybe<Relay_Set_Input>
  where: Relay_Bool_Exp
}

/** expression to compare columns of type numeric. All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: Maybe<Scalars['numeric']>
  _gt?: Maybe<Scalars['numeric']>
  _gte?: Maybe<Scalars['numeric']>
  _in?: Maybe<Array<Scalars['numeric']>>
  _is_null?: Maybe<Scalars['Boolean']>
  _lt?: Maybe<Scalars['numeric']>
  _lte?: Maybe<Scalars['numeric']>
  _neq?: Maybe<Scalars['numeric']>
  _nin?: Maybe<Array<Scalars['numeric']>>
}

/** column ordering options */
export enum Order_By {
  /** in the ascending order, nulls last */
  Asc = 'asc',
  /** in the ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in the ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in the descending order, nulls first */
  Desc = 'desc',
  /** in the descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in the descending order, nulls last */
  DescNullsLast = 'desc_nulls_last',
}

/** query root */
export type Query_Root = {
  __typename?: 'query_root'
  /** fetch data from the table: "relay" */
  relay: Array<Relay>
  /** fetch aggregated fields from the table: "relay" */
  relay_aggregate: Relay_Aggregate
  /** fetch data from the table: "relay_app_hourly" */
  relay_app_hourly: Array<Relay_App_Hourly>
  /** fetch aggregated fields from the table: "relay_app_hourly" */
  relay_app_hourly_aggregate: Relay_App_Hourly_Aggregate
  /** fetch data from the table: "relay_apps_daily" */
  relay_apps_daily: Array<Relay_Apps_Daily>
  /** fetch aggregated fields from the table: "relay_apps_daily" */
  relay_apps_daily_aggregate: Relay_Apps_Daily_Aggregate
  /** fetch data from the table: "relay_apps_hourly" */
  relay_apps_hourly: Array<Relay_Apps_Hourly>
  /** fetch aggregated fields from the table: "relay_apps_hourly" */
  relay_apps_hourly_aggregate: Relay_Apps_Hourly_Aggregate
  /** fetch data from the table: "relay_nodes_hourly" */
  relay_nodes_hourly: Array<Relay_Nodes_Hourly>
  /** fetch aggregated fields from the table: "relay_nodes_hourly" */
  relay_nodes_hourly_aggregate: Relay_Nodes_Hourly_Aggregate
  /** fetch data from the table: "relays_daily" */
  relays_daily: Array<Relays_Daily>
  /** fetch aggregated fields from the table: "relays_daily" */
  relays_daily_aggregate: Relays_Daily_Aggregate
}

/** query root */
export type Query_RootRelayArgs = {
  distinct_on?: Maybe<Array<Relay_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Order_By>>
  where?: Maybe<Relay_Bool_Exp>
}

/** query root */
export type Query_RootRelay_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Order_By>>
  where?: Maybe<Relay_Bool_Exp>
}

/** query root */
export type Query_RootRelay_App_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_App_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_App_Hourly_Order_By>>
  where?: Maybe<Relay_App_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelay_App_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_App_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_App_Hourly_Order_By>>
  where?: Maybe<Relay_App_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Apps_DailyArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Daily_Order_By>>
  where?: Maybe<Relay_Apps_Daily_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Apps_Daily_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Daily_Order_By>>
  where?: Maybe<Relay_Apps_Daily_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Apps_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Hourly_Order_By>>
  where?: Maybe<Relay_Apps_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Apps_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Hourly_Order_By>>
  where?: Maybe<Relay_Apps_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Nodes_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_Nodes_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Nodes_Hourly_Order_By>>
  where?: Maybe<Relay_Nodes_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelay_Nodes_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Nodes_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Nodes_Hourly_Order_By>>
  where?: Maybe<Relay_Nodes_Hourly_Bool_Exp>
}

/** query root */
export type Query_RootRelays_DailyArgs = {
  distinct_on?: Maybe<Array<Relays_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relays_Daily_Order_By>>
  where?: Maybe<Relays_Daily_Bool_Exp>
}

/** query root */
export type Query_RootRelays_Daily_AggregateArgs = {
  distinct_on?: Maybe<Array<Relays_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relays_Daily_Order_By>>
  where?: Maybe<Relays_Daily_Bool_Exp>
}

/** columns and relationships of "relay" */
export type Relay = {
  __typename?: 'relay'
  app_pub_key: Scalars['String']
  blockchain: Scalars['String']
  bytes: Scalars['numeric']
  elapsed_time: Scalars['float8']
  method?: Maybe<Scalars['String']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  timestamp: Scalars['timestamptz']
}

/** aggregated selection of "relay" */
export type Relay_Aggregate = {
  __typename?: 'relay_aggregate'
  aggregate?: Maybe<Relay_Aggregate_Fields>
  nodes: Array<Relay>
}

/** aggregate fields of "relay" */
export type Relay_Aggregate_Fields = {
  __typename?: 'relay_aggregate_fields'
  avg?: Maybe<Relay_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relay_Max_Fields>
  min?: Maybe<Relay_Min_Fields>
  stddev?: Maybe<Relay_Stddev_Fields>
  stddev_pop?: Maybe<Relay_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relay_Stddev_Samp_Fields>
  sum?: Maybe<Relay_Sum_Fields>
  var_pop?: Maybe<Relay_Var_Pop_Fields>
  var_samp?: Maybe<Relay_Var_Samp_Fields>
  variance?: Maybe<Relay_Variance_Fields>
}

/** aggregate fields of "relay" */
export type Relay_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relay_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relay" */
export type Relay_Aggregate_Order_By = {
  avg?: Maybe<Relay_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relay_Max_Order_By>
  min?: Maybe<Relay_Min_Order_By>
  stddev?: Maybe<Relay_Stddev_Order_By>
  stddev_pop?: Maybe<Relay_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relay_Stddev_Samp_Order_By>
  sum?: Maybe<Relay_Sum_Order_By>
  var_pop?: Maybe<Relay_Var_Pop_Order_By>
  var_samp?: Maybe<Relay_Var_Samp_Order_By>
  variance?: Maybe<Relay_Variance_Order_By>
}

/** columns and relationships of "relay_app_hourly" */
export type Relay_App_Hourly = {
  __typename?: 'relay_app_hourly'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** aggregated selection of "relay_app_hourly" */
export type Relay_App_Hourly_Aggregate = {
  __typename?: 'relay_app_hourly_aggregate'
  aggregate?: Maybe<Relay_App_Hourly_Aggregate_Fields>
  nodes: Array<Relay_App_Hourly>
}

/** aggregate fields of "relay_app_hourly" */
export type Relay_App_Hourly_Aggregate_Fields = {
  __typename?: 'relay_app_hourly_aggregate_fields'
  avg?: Maybe<Relay_App_Hourly_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relay_App_Hourly_Max_Fields>
  min?: Maybe<Relay_App_Hourly_Min_Fields>
  stddev?: Maybe<Relay_App_Hourly_Stddev_Fields>
  stddev_pop?: Maybe<Relay_App_Hourly_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relay_App_Hourly_Stddev_Samp_Fields>
  sum?: Maybe<Relay_App_Hourly_Sum_Fields>
  var_pop?: Maybe<Relay_App_Hourly_Var_Pop_Fields>
  var_samp?: Maybe<Relay_App_Hourly_Var_Samp_Fields>
  variance?: Maybe<Relay_App_Hourly_Variance_Fields>
}

/** aggregate fields of "relay_app_hourly" */
export type Relay_App_Hourly_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relay_App_Hourly_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relay_app_hourly" */
export type Relay_App_Hourly_Aggregate_Order_By = {
  avg?: Maybe<Relay_App_Hourly_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relay_App_Hourly_Max_Order_By>
  min?: Maybe<Relay_App_Hourly_Min_Order_By>
  stddev?: Maybe<Relay_App_Hourly_Stddev_Order_By>
  stddev_pop?: Maybe<Relay_App_Hourly_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relay_App_Hourly_Stddev_Samp_Order_By>
  sum?: Maybe<Relay_App_Hourly_Sum_Order_By>
  var_pop?: Maybe<Relay_App_Hourly_Var_Pop_Order_By>
  var_samp?: Maybe<Relay_App_Hourly_Var_Samp_Order_By>
  variance?: Maybe<Relay_App_Hourly_Variance_Order_By>
}

/** aggregate avg on columns */
export type Relay_App_Hourly_Avg_Fields = {
  __typename?: 'relay_app_hourly_avg_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Avg_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relay_app_hourly". All fields are combined with a logical 'AND'. */
export type Relay_App_Hourly_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relay_App_Hourly_Bool_Exp>>>
  _not?: Maybe<Relay_App_Hourly_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relay_App_Hourly_Bool_Exp>>>
  app_pub_key?: Maybe<String_Comparison_Exp>
  blockchain?: Maybe<String_Comparison_Exp>
  bucket?: Maybe<Timestamptz_Comparison_Exp>
  bytes?: Maybe<Numeric_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  result?: Maybe<Numeric_Comparison_Exp>
  total_relays?: Maybe<Bigint_Comparison_Exp>
}

/** aggregate max on columns */
export type Relay_App_Hourly_Max_Fields = {
  __typename?: 'relay_app_hourly_max_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by max() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Max_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relay_App_Hourly_Min_Fields = {
  __typename?: 'relay_app_hourly_min_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by min() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Min_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** ordering options when selecting data from "relay_app_hourly" */
export type Relay_App_Hourly_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** select columns of table "relay_app_hourly" */
export enum Relay_App_Hourly_Select_Column {
  /** column name */
  AppPubKey = 'app_pub_key',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  Bytes = 'bytes',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  Result = 'result',
  /** column name */
  TotalRelays = 'total_relays',
}

/** aggregate stddev on columns */
export type Relay_App_Hourly_Stddev_Fields = {
  __typename?: 'relay_app_hourly_stddev_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Stddev_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relay_App_Hourly_Stddev_Pop_Fields = {
  __typename?: 'relay_app_hourly_stddev_pop_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Stddev_Pop_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relay_App_Hourly_Stddev_Samp_Fields = {
  __typename?: 'relay_app_hourly_stddev_samp_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Stddev_Samp_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relay_App_Hourly_Sum_Fields = {
  __typename?: 'relay_app_hourly_sum_fields'
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by sum() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Sum_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relay_App_Hourly_Var_Pop_Fields = {
  __typename?: 'relay_app_hourly_var_pop_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Var_Pop_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relay_App_Hourly_Var_Samp_Fields = {
  __typename?: 'relay_app_hourly_var_samp_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Var_Samp_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relay_App_Hourly_Variance_Fields = {
  __typename?: 'relay_app_hourly_variance_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relay_app_hourly" */
export type Relay_App_Hourly_Variance_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** columns and relationships of "relay_apps_daily" */
export type Relay_Apps_Daily = {
  __typename?: 'relay_apps_daily'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** aggregated selection of "relay_apps_daily" */
export type Relay_Apps_Daily_Aggregate = {
  __typename?: 'relay_apps_daily_aggregate'
  aggregate?: Maybe<Relay_Apps_Daily_Aggregate_Fields>
  nodes: Array<Relay_Apps_Daily>
}

/** aggregate fields of "relay_apps_daily" */
export type Relay_Apps_Daily_Aggregate_Fields = {
  __typename?: 'relay_apps_daily_aggregate_fields'
  avg?: Maybe<Relay_Apps_Daily_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relay_Apps_Daily_Max_Fields>
  min?: Maybe<Relay_Apps_Daily_Min_Fields>
  stddev?: Maybe<Relay_Apps_Daily_Stddev_Fields>
  stddev_pop?: Maybe<Relay_Apps_Daily_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relay_Apps_Daily_Stddev_Samp_Fields>
  sum?: Maybe<Relay_Apps_Daily_Sum_Fields>
  var_pop?: Maybe<Relay_Apps_Daily_Var_Pop_Fields>
  var_samp?: Maybe<Relay_Apps_Daily_Var_Samp_Fields>
  variance?: Maybe<Relay_Apps_Daily_Variance_Fields>
}

/** aggregate fields of "relay_apps_daily" */
export type Relay_Apps_Daily_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relay_Apps_Daily_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relay_apps_daily" */
export type Relay_Apps_Daily_Aggregate_Order_By = {
  avg?: Maybe<Relay_Apps_Daily_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relay_Apps_Daily_Max_Order_By>
  min?: Maybe<Relay_Apps_Daily_Min_Order_By>
  stddev?: Maybe<Relay_Apps_Daily_Stddev_Order_By>
  stddev_pop?: Maybe<Relay_Apps_Daily_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relay_Apps_Daily_Stddev_Samp_Order_By>
  sum?: Maybe<Relay_Apps_Daily_Sum_Order_By>
  var_pop?: Maybe<Relay_Apps_Daily_Var_Pop_Order_By>
  var_samp?: Maybe<Relay_Apps_Daily_Var_Samp_Order_By>
  variance?: Maybe<Relay_Apps_Daily_Variance_Order_By>
}

/** aggregate avg on columns */
export type Relay_Apps_Daily_Avg_Fields = {
  __typename?: 'relay_apps_daily_avg_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Avg_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relay_apps_daily". All fields are combined with a logical 'AND'. */
export type Relay_Apps_Daily_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relay_Apps_Daily_Bool_Exp>>>
  _not?: Maybe<Relay_Apps_Daily_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relay_Apps_Daily_Bool_Exp>>>
  app_pub_key?: Maybe<String_Comparison_Exp>
  blockchain?: Maybe<String_Comparison_Exp>
  bucket?: Maybe<Timestamptz_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  result?: Maybe<Numeric_Comparison_Exp>
  total_relays?: Maybe<Bigint_Comparison_Exp>
}

/** aggregate max on columns */
export type Relay_Apps_Daily_Max_Fields = {
  __typename?: 'relay_apps_daily_max_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by max() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Max_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relay_Apps_Daily_Min_Fields = {
  __typename?: 'relay_apps_daily_min_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by min() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Min_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** ordering options when selecting data from "relay_apps_daily" */
export type Relay_Apps_Daily_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** select columns of table "relay_apps_daily" */
export enum Relay_Apps_Daily_Select_Column {
  /** column name */
  AppPubKey = 'app_pub_key',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  Result = 'result',
  /** column name */
  TotalRelays = 'total_relays',
}

/** aggregate stddev on columns */
export type Relay_Apps_Daily_Stddev_Fields = {
  __typename?: 'relay_apps_daily_stddev_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Stddev_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relay_Apps_Daily_Stddev_Pop_Fields = {
  __typename?: 'relay_apps_daily_stddev_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Stddev_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relay_Apps_Daily_Stddev_Samp_Fields = {
  __typename?: 'relay_apps_daily_stddev_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Stddev_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relay_Apps_Daily_Sum_Fields = {
  __typename?: 'relay_apps_daily_sum_fields'
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by sum() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Sum_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relay_Apps_Daily_Var_Pop_Fields = {
  __typename?: 'relay_apps_daily_var_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Var_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relay_Apps_Daily_Var_Samp_Fields = {
  __typename?: 'relay_apps_daily_var_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Var_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relay_Apps_Daily_Variance_Fields = {
  __typename?: 'relay_apps_daily_variance_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relay_apps_daily" */
export type Relay_Apps_Daily_Variance_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** columns and relationships of "relay_apps_hourly" */
export type Relay_Apps_Hourly = {
  __typename?: 'relay_apps_hourly'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** aggregated selection of "relay_apps_hourly" */
export type Relay_Apps_Hourly_Aggregate = {
  __typename?: 'relay_apps_hourly_aggregate'
  aggregate?: Maybe<Relay_Apps_Hourly_Aggregate_Fields>
  nodes: Array<Relay_Apps_Hourly>
}

/** aggregate fields of "relay_apps_hourly" */
export type Relay_Apps_Hourly_Aggregate_Fields = {
  __typename?: 'relay_apps_hourly_aggregate_fields'
  avg?: Maybe<Relay_Apps_Hourly_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relay_Apps_Hourly_Max_Fields>
  min?: Maybe<Relay_Apps_Hourly_Min_Fields>
  stddev?: Maybe<Relay_Apps_Hourly_Stddev_Fields>
  stddev_pop?: Maybe<Relay_Apps_Hourly_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relay_Apps_Hourly_Stddev_Samp_Fields>
  sum?: Maybe<Relay_Apps_Hourly_Sum_Fields>
  var_pop?: Maybe<Relay_Apps_Hourly_Var_Pop_Fields>
  var_samp?: Maybe<Relay_Apps_Hourly_Var_Samp_Fields>
  variance?: Maybe<Relay_Apps_Hourly_Variance_Fields>
}

/** aggregate fields of "relay_apps_hourly" */
export type Relay_Apps_Hourly_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relay_Apps_Hourly_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Aggregate_Order_By = {
  avg?: Maybe<Relay_Apps_Hourly_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relay_Apps_Hourly_Max_Order_By>
  min?: Maybe<Relay_Apps_Hourly_Min_Order_By>
  stddev?: Maybe<Relay_Apps_Hourly_Stddev_Order_By>
  stddev_pop?: Maybe<Relay_Apps_Hourly_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relay_Apps_Hourly_Stddev_Samp_Order_By>
  sum?: Maybe<Relay_Apps_Hourly_Sum_Order_By>
  var_pop?: Maybe<Relay_Apps_Hourly_Var_Pop_Order_By>
  var_samp?: Maybe<Relay_Apps_Hourly_Var_Samp_Order_By>
  variance?: Maybe<Relay_Apps_Hourly_Variance_Order_By>
}

/** aggregate avg on columns */
export type Relay_Apps_Hourly_Avg_Fields = {
  __typename?: 'relay_apps_hourly_avg_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Avg_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relay_apps_hourly". All fields are combined with a logical 'AND'. */
export type Relay_Apps_Hourly_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relay_Apps_Hourly_Bool_Exp>>>
  _not?: Maybe<Relay_Apps_Hourly_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relay_Apps_Hourly_Bool_Exp>>>
  app_pub_key?: Maybe<String_Comparison_Exp>
  blockchain?: Maybe<String_Comparison_Exp>
  bucket?: Maybe<Timestamptz_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  result?: Maybe<Numeric_Comparison_Exp>
  total_relays?: Maybe<Bigint_Comparison_Exp>
}

/** aggregate max on columns */
export type Relay_Apps_Hourly_Max_Fields = {
  __typename?: 'relay_apps_hourly_max_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by max() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Max_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relay_Apps_Hourly_Min_Fields = {
  __typename?: 'relay_apps_hourly_min_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by min() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Min_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** ordering options when selecting data from "relay_apps_hourly" */
export type Relay_Apps_Hourly_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** select columns of table "relay_apps_hourly" */
export enum Relay_Apps_Hourly_Select_Column {
  /** column name */
  AppPubKey = 'app_pub_key',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  Result = 'result',
  /** column name */
  TotalRelays = 'total_relays',
}

/** aggregate stddev on columns */
export type Relay_Apps_Hourly_Stddev_Fields = {
  __typename?: 'relay_apps_hourly_stddev_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Stddev_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relay_Apps_Hourly_Stddev_Pop_Fields = {
  __typename?: 'relay_apps_hourly_stddev_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Stddev_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relay_Apps_Hourly_Stddev_Samp_Fields = {
  __typename?: 'relay_apps_hourly_stddev_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Stddev_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relay_Apps_Hourly_Sum_Fields = {
  __typename?: 'relay_apps_hourly_sum_fields'
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by sum() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Sum_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relay_Apps_Hourly_Var_Pop_Fields = {
  __typename?: 'relay_apps_hourly_var_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Var_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relay_Apps_Hourly_Var_Samp_Fields = {
  __typename?: 'relay_apps_hourly_var_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Var_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relay_Apps_Hourly_Variance_Fields = {
  __typename?: 'relay_apps_hourly_variance_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relay_apps_hourly" */
export type Relay_Apps_Hourly_Variance_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** input type for inserting array relation for remote table "relay" */
export type Relay_Arr_Rel_Insert_Input = {
  data: Array<Relay_Insert_Input>
}

/** aggregate avg on columns */
export type Relay_Avg_Fields = {
  __typename?: 'relay_avg_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relay" */
export type Relay_Avg_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relay". All fields are combined with a logical 'AND'. */
export type Relay_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relay_Bool_Exp>>>
  _not?: Maybe<Relay_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relay_Bool_Exp>>>
  app_pub_key?: Maybe<String_Comparison_Exp>
  blockchain?: Maybe<String_Comparison_Exp>
  bytes?: Maybe<Numeric_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  method?: Maybe<String_Comparison_Exp>
  result?: Maybe<Numeric_Comparison_Exp>
  service_node?: Maybe<String_Comparison_Exp>
  timestamp?: Maybe<Timestamptz_Comparison_Exp>
}

/** input type for incrementing integer column in table "relay" */
export type Relay_Inc_Input = {
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
}

/** input type for inserting data into table "relay" */
export type Relay_Insert_Input = {
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  method?: Maybe<Scalars['String']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  timestamp?: Maybe<Scalars['timestamptz']>
}

/** aggregate max on columns */
export type Relay_Max_Fields = {
  __typename?: 'relay_max_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  method?: Maybe<Scalars['String']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  timestamp?: Maybe<Scalars['timestamptz']>
}

/** order by max() on columns of table "relay" */
export type Relay_Max_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  method?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  timestamp?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relay_Min_Fields = {
  __typename?: 'relay_min_fields'
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  method?: Maybe<Scalars['String']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  timestamp?: Maybe<Scalars['timestamptz']>
}

/** order by min() on columns of table "relay" */
export type Relay_Min_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  method?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  timestamp?: Maybe<Order_By>
}

/** response of any mutation on the table "relay" */
export type Relay_Mutation_Response = {
  __typename?: 'relay_mutation_response'
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int']
  /** data of the affected rows by the mutation */
  returning: Array<Relay>
}

/** columns and relationships of "relay_nodes_hourly" */
export type Relay_Nodes_Hourly = {
  __typename?: 'relay_nodes_hourly'
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** aggregated selection of "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Aggregate = {
  __typename?: 'relay_nodes_hourly_aggregate'
  aggregate?: Maybe<Relay_Nodes_Hourly_Aggregate_Fields>
  nodes: Array<Relay_Nodes_Hourly>
}

/** aggregate fields of "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Aggregate_Fields = {
  __typename?: 'relay_nodes_hourly_aggregate_fields'
  avg?: Maybe<Relay_Nodes_Hourly_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relay_Nodes_Hourly_Max_Fields>
  min?: Maybe<Relay_Nodes_Hourly_Min_Fields>
  stddev?: Maybe<Relay_Nodes_Hourly_Stddev_Fields>
  stddev_pop?: Maybe<Relay_Nodes_Hourly_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relay_Nodes_Hourly_Stddev_Samp_Fields>
  sum?: Maybe<Relay_Nodes_Hourly_Sum_Fields>
  var_pop?: Maybe<Relay_Nodes_Hourly_Var_Pop_Fields>
  var_samp?: Maybe<Relay_Nodes_Hourly_Var_Samp_Fields>
  variance?: Maybe<Relay_Nodes_Hourly_Variance_Fields>
}

/** aggregate fields of "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relay_Nodes_Hourly_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Aggregate_Order_By = {
  avg?: Maybe<Relay_Nodes_Hourly_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relay_Nodes_Hourly_Max_Order_By>
  min?: Maybe<Relay_Nodes_Hourly_Min_Order_By>
  stddev?: Maybe<Relay_Nodes_Hourly_Stddev_Order_By>
  stddev_pop?: Maybe<Relay_Nodes_Hourly_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relay_Nodes_Hourly_Stddev_Samp_Order_By>
  sum?: Maybe<Relay_Nodes_Hourly_Sum_Order_By>
  var_pop?: Maybe<Relay_Nodes_Hourly_Var_Pop_Order_By>
  var_samp?: Maybe<Relay_Nodes_Hourly_Var_Samp_Order_By>
  variance?: Maybe<Relay_Nodes_Hourly_Variance_Order_By>
}

/** aggregate avg on columns */
export type Relay_Nodes_Hourly_Avg_Fields = {
  __typename?: 'relay_nodes_hourly_avg_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Avg_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relay_nodes_hourly". All fields are combined with a logical 'AND'. */
export type Relay_Nodes_Hourly_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relay_Nodes_Hourly_Bool_Exp>>>
  _not?: Maybe<Relay_Nodes_Hourly_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relay_Nodes_Hourly_Bool_Exp>>>
  blockchain?: Maybe<String_Comparison_Exp>
  bucket?: Maybe<Timestamptz_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  result?: Maybe<Numeric_Comparison_Exp>
  service_node?: Maybe<String_Comparison_Exp>
  total_relays?: Maybe<Bigint_Comparison_Exp>
}

/** aggregate max on columns */
export type Relay_Nodes_Hourly_Max_Fields = {
  __typename?: 'relay_nodes_hourly_max_fields'
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by max() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Max_Order_By = {
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relay_Nodes_Hourly_Min_Fields = {
  __typename?: 'relay_nodes_hourly_min_fields'
  blockchain?: Maybe<Scalars['String']>
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by min() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Min_Order_By = {
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** ordering options when selecting data from "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Order_By = {
  blockchain?: Maybe<Order_By>
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** select columns of table "relay_nodes_hourly" */
export enum Relay_Nodes_Hourly_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  Result = 'result',
  /** column name */
  ServiceNode = 'service_node',
  /** column name */
  TotalRelays = 'total_relays',
}

/** aggregate stddev on columns */
export type Relay_Nodes_Hourly_Stddev_Fields = {
  __typename?: 'relay_nodes_hourly_stddev_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Stddev_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relay_Nodes_Hourly_Stddev_Pop_Fields = {
  __typename?: 'relay_nodes_hourly_stddev_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Stddev_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relay_Nodes_Hourly_Stddev_Samp_Fields = {
  __typename?: 'relay_nodes_hourly_stddev_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Stddev_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relay_Nodes_Hourly_Sum_Fields = {
  __typename?: 'relay_nodes_hourly_sum_fields'
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by sum() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Sum_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relay_Nodes_Hourly_Var_Pop_Fields = {
  __typename?: 'relay_nodes_hourly_var_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Var_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relay_Nodes_Hourly_Var_Samp_Fields = {
  __typename?: 'relay_nodes_hourly_var_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Var_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relay_Nodes_Hourly_Variance_Fields = {
  __typename?: 'relay_nodes_hourly_variance_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relay_nodes_hourly" */
export type Relay_Nodes_Hourly_Variance_Order_By = {
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** input type for inserting object relation for remote table "relay" */
export type Relay_Obj_Rel_Insert_Input = {
  data: Relay_Insert_Input
}

/** ordering options when selecting data from "relay" */
export type Relay_Order_By = {
  app_pub_key?: Maybe<Order_By>
  blockchain?: Maybe<Order_By>
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  method?: Maybe<Order_By>
  result?: Maybe<Order_By>
  service_node?: Maybe<Order_By>
  timestamp?: Maybe<Order_By>
}

/** select columns of table "relay" */
export enum Relay_Select_Column {
  /** column name */
  AppPubKey = 'app_pub_key',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Bytes = 'bytes',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  Method = 'method',
  /** column name */
  Result = 'result',
  /** column name */
  ServiceNode = 'service_node',
  /** column name */
  Timestamp = 'timestamp',
}

/** input type for updating data in table "relay" */
export type Relay_Set_Input = {
  app_pub_key?: Maybe<Scalars['String']>
  blockchain?: Maybe<Scalars['String']>
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  method?: Maybe<Scalars['String']>
  result?: Maybe<Scalars['numeric']>
  service_node?: Maybe<Scalars['String']>
  timestamp?: Maybe<Scalars['timestamptz']>
}

/** aggregate stddev on columns */
export type Relay_Stddev_Fields = {
  __typename?: 'relay_stddev_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relay" */
export type Relay_Stddev_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relay_Stddev_Pop_Fields = {
  __typename?: 'relay_stddev_pop_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relay" */
export type Relay_Stddev_Pop_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relay_Stddev_Samp_Fields = {
  __typename?: 'relay_stddev_samp_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relay" */
export type Relay_Stddev_Samp_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relay_Sum_Fields = {
  __typename?: 'relay_sum_fields'
  bytes?: Maybe<Scalars['numeric']>
  elapsed_time?: Maybe<Scalars['float8']>
  result?: Maybe<Scalars['numeric']>
}

/** order by sum() on columns of table "relay" */
export type Relay_Sum_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relay_Var_Pop_Fields = {
  __typename?: 'relay_var_pop_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relay" */
export type Relay_Var_Pop_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relay_Var_Samp_Fields = {
  __typename?: 'relay_var_samp_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relay" */
export type Relay_Var_Samp_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relay_Variance_Fields = {
  __typename?: 'relay_variance_fields'
  bytes?: Maybe<Scalars['Float']>
  elapsed_time?: Maybe<Scalars['Float']>
  result?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relay" */
export type Relay_Variance_Order_By = {
  bytes?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  result?: Maybe<Order_By>
}

/** columns and relationships of "relays_daily" */
export type Relays_Daily = {
  __typename?: 'relays_daily'
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** aggregated selection of "relays_daily" */
export type Relays_Daily_Aggregate = {
  __typename?: 'relays_daily_aggregate'
  aggregate?: Maybe<Relays_Daily_Aggregate_Fields>
  nodes: Array<Relays_Daily>
}

/** aggregate fields of "relays_daily" */
export type Relays_Daily_Aggregate_Fields = {
  __typename?: 'relays_daily_aggregate_fields'
  avg?: Maybe<Relays_Daily_Avg_Fields>
  count?: Maybe<Scalars['Int']>
  max?: Maybe<Relays_Daily_Max_Fields>
  min?: Maybe<Relays_Daily_Min_Fields>
  stddev?: Maybe<Relays_Daily_Stddev_Fields>
  stddev_pop?: Maybe<Relays_Daily_Stddev_Pop_Fields>
  stddev_samp?: Maybe<Relays_Daily_Stddev_Samp_Fields>
  sum?: Maybe<Relays_Daily_Sum_Fields>
  var_pop?: Maybe<Relays_Daily_Var_Pop_Fields>
  var_samp?: Maybe<Relays_Daily_Var_Samp_Fields>
  variance?: Maybe<Relays_Daily_Variance_Fields>
}

/** aggregate fields of "relays_daily" */
export type Relays_Daily_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Relays_Daily_Select_Column>>
  distinct?: Maybe<Scalars['Boolean']>
}

/** order by aggregate values of table "relays_daily" */
export type Relays_Daily_Aggregate_Order_By = {
  avg?: Maybe<Relays_Daily_Avg_Order_By>
  count?: Maybe<Order_By>
  max?: Maybe<Relays_Daily_Max_Order_By>
  min?: Maybe<Relays_Daily_Min_Order_By>
  stddev?: Maybe<Relays_Daily_Stddev_Order_By>
  stddev_pop?: Maybe<Relays_Daily_Stddev_Pop_Order_By>
  stddev_samp?: Maybe<Relays_Daily_Stddev_Samp_Order_By>
  sum?: Maybe<Relays_Daily_Sum_Order_By>
  var_pop?: Maybe<Relays_Daily_Var_Pop_Order_By>
  var_samp?: Maybe<Relays_Daily_Var_Samp_Order_By>
  variance?: Maybe<Relays_Daily_Variance_Order_By>
}

/** aggregate avg on columns */
export type Relays_Daily_Avg_Fields = {
  __typename?: 'relays_daily_avg_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by avg() on columns of table "relays_daily" */
export type Relays_Daily_Avg_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** Boolean expression to filter rows from the table "relays_daily". All fields are combined with a logical 'AND'. */
export type Relays_Daily_Bool_Exp = {
  _and?: Maybe<Array<Maybe<Relays_Daily_Bool_Exp>>>
  _not?: Maybe<Relays_Daily_Bool_Exp>
  _or?: Maybe<Array<Maybe<Relays_Daily_Bool_Exp>>>
  bucket?: Maybe<Timestamptz_Comparison_Exp>
  elapsed_time?: Maybe<Float8_Comparison_Exp>
  total_relays?: Maybe<Bigint_Comparison_Exp>
}

/** aggregate max on columns */
export type Relays_Daily_Max_Fields = {
  __typename?: 'relays_daily_max_fields'
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by max() on columns of table "relays_daily" */
export type Relays_Daily_Max_Order_By = {
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate min on columns */
export type Relays_Daily_Min_Fields = {
  __typename?: 'relays_daily_min_fields'
  bucket?: Maybe<Scalars['timestamptz']>
  elapsed_time?: Maybe<Scalars['float8']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by min() on columns of table "relays_daily" */
export type Relays_Daily_Min_Order_By = {
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** ordering options when selecting data from "relays_daily" */
export type Relays_Daily_Order_By = {
  bucket?: Maybe<Order_By>
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** select columns of table "relays_daily" */
export enum Relays_Daily_Select_Column {
  /** column name */
  Bucket = 'bucket',
  /** column name */
  ElapsedTime = 'elapsed_time',
  /** column name */
  TotalRelays = 'total_relays',
}

/** aggregate stddev on columns */
export type Relays_Daily_Stddev_Fields = {
  __typename?: 'relays_daily_stddev_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev() on columns of table "relays_daily" */
export type Relays_Daily_Stddev_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_pop on columns */
export type Relays_Daily_Stddev_Pop_Fields = {
  __typename?: 'relays_daily_stddev_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_pop() on columns of table "relays_daily" */
export type Relays_Daily_Stddev_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate stddev_samp on columns */
export type Relays_Daily_Stddev_Samp_Fields = {
  __typename?: 'relays_daily_stddev_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by stddev_samp() on columns of table "relays_daily" */
export type Relays_Daily_Stddev_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate sum on columns */
export type Relays_Daily_Sum_Fields = {
  __typename?: 'relays_daily_sum_fields'
  elapsed_time?: Maybe<Scalars['float8']>
  total_relays?: Maybe<Scalars['bigint']>
}

/** order by sum() on columns of table "relays_daily" */
export type Relays_Daily_Sum_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_pop on columns */
export type Relays_Daily_Var_Pop_Fields = {
  __typename?: 'relays_daily_var_pop_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_pop() on columns of table "relays_daily" */
export type Relays_Daily_Var_Pop_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate var_samp on columns */
export type Relays_Daily_Var_Samp_Fields = {
  __typename?: 'relays_daily_var_samp_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by var_samp() on columns of table "relays_daily" */
export type Relays_Daily_Var_Samp_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** aggregate variance on columns */
export type Relays_Daily_Variance_Fields = {
  __typename?: 'relays_daily_variance_fields'
  elapsed_time?: Maybe<Scalars['Float']>
  total_relays?: Maybe<Scalars['Float']>
}

/** order by variance() on columns of table "relays_daily" */
export type Relays_Daily_Variance_Order_By = {
  elapsed_time?: Maybe<Order_By>
  total_relays?: Maybe<Order_By>
}

/** subscription root */
export type Subscription_Root = {
  __typename?: 'subscription_root'
  /** fetch data from the table: "relay" */
  relay: Array<Relay>
  /** fetch aggregated fields from the table: "relay" */
  relay_aggregate: Relay_Aggregate
  /** fetch data from the table: "relay_app_hourly" */
  relay_app_hourly: Array<Relay_App_Hourly>
  /** fetch aggregated fields from the table: "relay_app_hourly" */
  relay_app_hourly_aggregate: Relay_App_Hourly_Aggregate
  /** fetch data from the table: "relay_apps_daily" */
  relay_apps_daily: Array<Relay_Apps_Daily>
  /** fetch aggregated fields from the table: "relay_apps_daily" */
  relay_apps_daily_aggregate: Relay_Apps_Daily_Aggregate
  /** fetch data from the table: "relay_apps_hourly" */
  relay_apps_hourly: Array<Relay_Apps_Hourly>
  /** fetch aggregated fields from the table: "relay_apps_hourly" */
  relay_apps_hourly_aggregate: Relay_Apps_Hourly_Aggregate
  /** fetch data from the table: "relay_nodes_hourly" */
  relay_nodes_hourly: Array<Relay_Nodes_Hourly>
  /** fetch aggregated fields from the table: "relay_nodes_hourly" */
  relay_nodes_hourly_aggregate: Relay_Nodes_Hourly_Aggregate
  /** fetch data from the table: "relays_daily" */
  relays_daily: Array<Relays_Daily>
  /** fetch aggregated fields from the table: "relays_daily" */
  relays_daily_aggregate: Relays_Daily_Aggregate
}

/** subscription root */
export type Subscription_RootRelayArgs = {
  distinct_on?: Maybe<Array<Relay_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Order_By>>
  where?: Maybe<Relay_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Order_By>>
  where?: Maybe<Relay_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_App_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_App_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_App_Hourly_Order_By>>
  where?: Maybe<Relay_App_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_App_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_App_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_App_Hourly_Order_By>>
  where?: Maybe<Relay_App_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Apps_DailyArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Daily_Order_By>>
  where?: Maybe<Relay_Apps_Daily_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Apps_Daily_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Daily_Order_By>>
  where?: Maybe<Relay_Apps_Daily_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Apps_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Hourly_Order_By>>
  where?: Maybe<Relay_Apps_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Apps_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Apps_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Apps_Hourly_Order_By>>
  where?: Maybe<Relay_Apps_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Nodes_HourlyArgs = {
  distinct_on?: Maybe<Array<Relay_Nodes_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Nodes_Hourly_Order_By>>
  where?: Maybe<Relay_Nodes_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelay_Nodes_Hourly_AggregateArgs = {
  distinct_on?: Maybe<Array<Relay_Nodes_Hourly_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relay_Nodes_Hourly_Order_By>>
  where?: Maybe<Relay_Nodes_Hourly_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelays_DailyArgs = {
  distinct_on?: Maybe<Array<Relays_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relays_Daily_Order_By>>
  where?: Maybe<Relays_Daily_Bool_Exp>
}

/** subscription root */
export type Subscription_RootRelays_Daily_AggregateArgs = {
  distinct_on?: Maybe<Array<Relays_Daily_Select_Column>>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order_by?: Maybe<Array<Relays_Daily_Order_By>>
  where?: Maybe<Relays_Daily_Bool_Exp>
}

/** expression to compare columns of type timestamptz. All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: Maybe<Scalars['timestamptz']>
  _gt?: Maybe<Scalars['timestamptz']>
  _gte?: Maybe<Scalars['timestamptz']>
  _in?: Maybe<Array<Scalars['timestamptz']>>
  _is_null?: Maybe<Scalars['Boolean']>
  _lt?: Maybe<Scalars['timestamptz']>
  _lte?: Maybe<Scalars['timestamptz']>
  _neq?: Maybe<Scalars['timestamptz']>
  _nin?: Maybe<Array<Scalars['timestamptz']>>
}

export const GetTotalRelaysAndLatency = gql`
  query getTotalRelaysAndLatency($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalRangedRelaysAndLatency = gql`
  query getTotalRangedRelaysAndLatency(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalSuccessfulRelays = gql`
  query getTotalSuccessfulRelays($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalSuccessfulRangedRelays = gql`
  query getTotalSuccessfulRangedRelays(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`
export const GetDailyTotalRelays = gql`
  query getDailyTotalRelays($_eq: String, $_gte: timestamptz) {
    relay_apps_daily(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      bucket
      total_relays
    }
  }
`
export const GetLastSessionAppRelays = gql`
  query getLastSessionAppRelays(
    $_eq: String
    $_gte: timestamptz
    $_buckets: Int
  ) {
    relay_app_hourly(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
      limit: $_buckets
    ) {
      bucket
      total_relays
    }
  }
`
export const GetLatestRelays = gql`
  query getLatestRelays($_eq: String, $limit: Int, $offset: Int) {
    relay(
      limit: $limit
      offset: $offset
      order_by: { timestamp: desc }
      where: { app_pub_key: { _eq: $_eq } }
    ) {
      service_node
      method
      result
      bytes
      timestamp
      elapsed_time
    }
  }
`
export const GetTotalRelayDuration = gql`
  query getTotalRelayDuration($_eq: String, $_gte: timestamptz) {
    relay_app_hourly(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        elapsed_time: { _lte: "3" }
      }
      order_by: { bucket: desc }
    ) {
      elapsed_time
      bucket
    }
  }
`
export const GetDailyNetworkRelays = gql`
  query getDailyNetworkRelays {
    relays_daily(limit: 8, order_by: { bucket: desc }) {
      bucket
      total_relays
    }
  }
`
export const GetTotalSuccesfulNetworkRelays = gql`
  query getTotalSuccesfulNetworkRelays($_gte: timestamptz!) {
    relay_apps_hourly_aggregate(
      where: { bucket: { _gte: $_gte }, result: { _eq: "200" } }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`
export const GetTotalNetworkRelays = gql`
  query getTotalNetworkRelays($_gte: timestamptz!) {
    relay_apps_hourly_aggregate(where: { bucket: { _gte: $_gte } }) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`

export const GetTotalRelaysAndLatencyDocument = gql`
  query getTotalRelaysAndLatency($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalRangedRelaysAndLatencyDocument = gql`
  query getTotalRangedRelaysAndLatency(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalSuccessfulRelaysDocument = gql`
  query getTotalSuccessfulRelays($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`
export const GetTotalSuccessfulRangedRelaysDocument = gql`
  query getTotalSuccessfulRangedRelays(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`
export const GetDailyTotalRelaysDocument = gql`
  query getDailyTotalRelays($_eq: String, $_gte: timestamptz) {
    relay_apps_daily(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      bucket
      total_relays
    }
  }
`
export const GetLastSessionAppRelaysDocument = gql`
  query getLastSessionAppRelays(
    $_eq: String
    $_gte: timestamptz
    $_buckets: Int
  ) {
    relay_app_hourly(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
      limit: $_buckets
    ) {
      bucket
      total_relays
    }
  }
`
export const GetLatestRelaysDocument = gql`
  query getLatestRelays($_eq: String, $limit: Int, $offset: Int) {
    relay(
      limit: $limit
      offset: $offset
      order_by: { timestamp: desc }
      where: { app_pub_key: { _eq: $_eq } }
    ) {
      service_node
      method
      result
      bytes
      timestamp
      elapsed_time
    }
  }
`
export const GetTotalRelayDurationDocument = gql`
  query getTotalRelayDuration($_eq: String, $_gte: timestamptz) {
    relay_app_hourly(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        elapsed_time: { _lte: "3" }
      }
      order_by: { bucket: desc }
    ) {
      elapsed_time
      bucket
    }
  }
`
export const GetDailyNetworkRelaysDocument = gql`
  query getDailyNetworkRelays {
    relays_daily(limit: 8, order_by: { bucket: desc }) {
      bucket
      total_relays
    }
  }
`
export const GetTotalSuccesfulNetworkRelaysDocument = gql`
  query getTotalSuccesfulNetworkRelays($_gte: timestamptz!) {
    relay_apps_hourly_aggregate(
      where: { bucket: { _gte: $_gte }, result: { _eq: "200" } }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`
export const GetTotalNetworkRelaysDocument = gql`
  query getTotalNetworkRelays($_gte: timestamptz!) {
    relay_apps_hourly_aggregate(where: { bucket: { _gte: $_gte } }) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action()

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    getTotalRelaysAndLatency(
      variables?: GetTotalRelaysAndLatencyQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalRelaysAndLatencyQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalRelaysAndLatencyQuery>(
            GetTotalRelaysAndLatencyDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalRelaysAndLatency'
      )
    },
    getTotalRangedRelaysAndLatency(
      variables?: GetTotalRangedRelaysAndLatencyQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalRangedRelaysAndLatencyQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalRangedRelaysAndLatencyQuery>(
            GetTotalRangedRelaysAndLatencyDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalRangedRelaysAndLatency'
      )
    },
    getTotalSuccessfulRelays(
      variables?: GetTotalSuccessfulRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalSuccessfulRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalSuccessfulRelaysQuery>(
            GetTotalSuccessfulRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalSuccessfulRelays'
      )
    },
    getTotalSuccessfulRangedRelays(
      variables?: GetTotalSuccessfulRangedRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalSuccessfulRangedRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalSuccessfulRangedRelaysQuery>(
            GetTotalSuccessfulRangedRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalSuccessfulRangedRelays'
      )
    },
    getDailyTotalRelays(
      variables?: GetDailyTotalRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetDailyTotalRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDailyTotalRelaysQuery>(
            GetDailyTotalRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getDailyTotalRelays'
      )
    },
    getLastSessionAppRelays(
      variables?: GetLastSessionAppRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetLastSessionAppRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetLastSessionAppRelaysQuery>(
            GetLastSessionAppRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getLastSessionAppRelays'
      )
    },
    getLatestRelays(
      variables?: GetLatestRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetLatestRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetLatestRelaysQuery>(
            GetLatestRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getLatestRelays'
      )
    },
    getTotalRelayDuration(
      variables?: GetTotalRelayDurationQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalRelayDurationQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalRelayDurationQuery>(
            GetTotalRelayDurationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalRelayDuration'
      )
    },
    getDailyNetworkRelays(
      variables?: GetDailyNetworkRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetDailyNetworkRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDailyNetworkRelaysQuery>(
            GetDailyNetworkRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getDailyNetworkRelays'
      )
    },
    getTotalSuccesfulNetworkRelays(
      variables: GetTotalSuccesfulNetworkRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalSuccesfulNetworkRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalSuccesfulNetworkRelaysQuery>(
            GetTotalSuccesfulNetworkRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalSuccesfulNetworkRelays'
      )
    },
    getTotalNetworkRelays(
      variables: GetTotalNetworkRelaysQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetTotalNetworkRelaysQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTotalNetworkRelaysQuery>(
            GetTotalNetworkRelaysDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getTotalNetworkRelays'
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
export type GetTotalRelaysAndLatencyQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
}>

export type GetTotalRelaysAndLatencyQuery = { __typename?: 'query_root' } & {
  relay_apps_daily_aggregate: { __typename?: 'relay_apps_daily_aggregate' } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_daily_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_daily_sum_fields' } & Pick<
            Relay_Apps_Daily_Sum_Fields,
            'total_relays'
          >
        >
        avg?: Maybe<
          { __typename?: 'relay_apps_daily_avg_fields' } & Pick<
            Relay_Apps_Daily_Avg_Fields,
            'elapsed_time'
          >
        >
      }
    >
  }
}

export type GetTotalRangedRelaysAndLatencyQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
  _lte?: Maybe<Scalars['timestamptz']>
}>

export type GetTotalRangedRelaysAndLatencyQuery = {
  __typename?: 'query_root'
} & {
  relay_apps_daily_aggregate: { __typename?: 'relay_apps_daily_aggregate' } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_daily_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_daily_sum_fields' } & Pick<
            Relay_Apps_Daily_Sum_Fields,
            'total_relays'
          >
        >
        avg?: Maybe<
          { __typename?: 'relay_apps_daily_avg_fields' } & Pick<
            Relay_Apps_Daily_Avg_Fields,
            'elapsed_time'
          >
        >
      }
    >
  }
}

export type GetTotalSuccessfulRelaysQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
}>

export type GetTotalSuccessfulRelaysQuery = { __typename?: 'query_root' } & {
  relay_apps_daily_aggregate: { __typename?: 'relay_apps_daily_aggregate' } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_daily_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_daily_sum_fields' } & Pick<
            Relay_Apps_Daily_Sum_Fields,
            'total_relays'
          >
        >
        avg?: Maybe<
          { __typename?: 'relay_apps_daily_avg_fields' } & Pick<
            Relay_Apps_Daily_Avg_Fields,
            'elapsed_time'
          >
        >
      }
    >
  }
}

export type GetTotalSuccessfulRangedRelaysQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
  _lte?: Maybe<Scalars['timestamptz']>
}>

export type GetTotalSuccessfulRangedRelaysQuery = {
  __typename?: 'query_root'
} & {
  relay_apps_daily_aggregate: { __typename?: 'relay_apps_daily_aggregate' } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_daily_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_daily_sum_fields' } & Pick<
            Relay_Apps_Daily_Sum_Fields,
            'total_relays'
          >
        >
      }
    >
  }
}

export type GetDailyTotalRelaysQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
}>

export type GetDailyTotalRelaysQuery = { __typename?: 'query_root' } & {
  relay_apps_daily: Array<
    { __typename?: 'relay_apps_daily' } & Pick<
      Relay_Apps_Daily,
      'bucket' | 'total_relays'
    >
  >
}

export type GetLastSessionAppRelaysQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
  _buckets?: Maybe<Scalars['Int']>
}>

export type GetLastSessionAppRelaysQuery = { __typename?: 'query_root' } & {
  relay_app_hourly: Array<
    { __typename?: 'relay_app_hourly' } & Pick<
      Relay_App_Hourly,
      'bucket' | 'total_relays'
    >
  >
}

export type GetLatestRelaysQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
}>

export type GetLatestRelaysQuery = { __typename?: 'query_root' } & {
  relay: Array<
    { __typename?: 'relay' } & Pick<
      Relay,
      | 'service_node'
      | 'method'
      | 'result'
      | 'bytes'
      | 'timestamp'
      | 'elapsed_time'
    >
  >
}

export type GetTotalRelayDurationQueryVariables = Exact<{
  _eq?: Maybe<Scalars['String']>
  _gte?: Maybe<Scalars['timestamptz']>
}>

export type GetTotalRelayDurationQuery = { __typename?: 'query_root' } & {
  relay_app_hourly: Array<
    { __typename?: 'relay_app_hourly' } & Pick<
      Relay_App_Hourly,
      'elapsed_time' | 'bucket'
    >
  >
}

export type GetDailyNetworkRelaysQueryVariables = Exact<{
  [key: string]: never
}>

export type GetDailyNetworkRelaysQuery = { __typename?: 'query_root' } & {
  relays_daily: Array<
    { __typename?: 'relays_daily' } & Pick<
      Relays_Daily,
      'bucket' | 'total_relays'
    >
  >
}

export type GetTotalSuccesfulNetworkRelaysQueryVariables = Exact<{
  _gte: Scalars['timestamptz']
}>

export type GetTotalSuccesfulNetworkRelaysQuery = {
  __typename?: 'query_root'
} & {
  relay_apps_hourly_aggregate: {
    __typename?: 'relay_apps_hourly_aggregate'
  } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_hourly_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_hourly_sum_fields' } & Pick<
            Relay_Apps_Hourly_Sum_Fields,
            'total_relays'
          >
        >
      }
    >
  }
}

export type GetTotalNetworkRelaysQueryVariables = Exact<{
  _gte: Scalars['timestamptz']
}>

export type GetTotalNetworkRelaysQuery = { __typename?: 'query_root' } & {
  relay_apps_hourly_aggregate: {
    __typename?: 'relay_apps_hourly_aggregate'
  } & {
    aggregate?: Maybe<
      { __typename?: 'relay_apps_hourly_aggregate_fields' } & {
        sum?: Maybe<
          { __typename?: 'relay_apps_hourly_sum_fields' } & Pick<
            Relay_Apps_Hourly_Sum_Fields,
            'total_relays'
          >
        >
      }
    >
  }
}
