<div align="center">
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a href="https://www.pokt.network">
    <img src="https://user-images.githubusercontent.com/16605170/74199287-94f17680-4c18-11ea-9de2-b094fab91431.png" alt="Pocket Network logo" width="340"/>
  </a>
</div>

# Pocket Dashboard

The pocket dashboard where you can register, stake, unstake, unjail(nodes) apps and nodes on the pocket network.

## Overview
<div>
    <a href="https://github.com/pokt-network/pocket-dashboard/pulse"><img src="https://img.shields.io/github/contributors/pokt-network/pocket-dashboard.svg"/></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"/></a>
    <a href="https://github.com/pokt-network/pocket-dashboard/pulse"><img src="https://img.shields.io/github/last-commit/pokt-network/pocket-dashboard.svg"/></a>
    <a href="https://github.com/pokt-network/pocket-dashboard/pulls"><img src="https://img.shields.io/github/issues-pr/pokt-network/pocket-dashboard.svg"/></a>
    <a href="https://github.com/pokt-network/pocket-dashboard/releases"><img src="https://img.shields.io/badge/platform-linux%20%7C%20windows%20%7C%20macos-pink.svg"/></a>
    <a href="https://github.com/pokt-network/pocket-dashboard/issues"><img src="https://img.shields.io/github/issues-closed/pokt-network/pocket-dashboard.svg"/></a>
</div>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installation

To install, just use `yarn` on both backend and frontend packages. Note that we're using Node 12.15.0 LTS due to one of our libraries. We recommend using [NVM](https://github.com/nvm-sh/nvm) so you can switch versions on the fly.

#### Infrastructure

- MongoDB
- Redis

To run the pocket dashboard on your machine, perform the following steps:

#### Backend
```
1. yarn
2. yarn build // on a separate console.
3. yarn start // on a seperate console.
```

#### Frontend
```
1. yarn
3. yarn start
```

Go to http://localhost/login to see the login page.

## Documentation

You must create the following account/app/api keys:

- Github app
- Google app
- Sendgrid api key
- Stripe account
- Recapcha api key

### Backend

```
# Web server
PORT=4200

# Persistence
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=pokt_dashboard

# Pocket Network
POCKET_NETWORK_DISPATCHERS=https://node1.testnet.pokt.network:443,https://node2.testnet.pokt.network:443,https://node3.testnet.pokt.network:443,https://node4.testnet.pokt.network:443,https://node5.testnet.pokt.network:443,https://node6.testnet.pokt.network:443,https://node7.testnet.pokt.network:443
POCKET_NETWORK_CHAIN_HASH=0002
POCKET_NETWORK_CHAIN_ID=testnet
POCKET_NETWORK_MAX_DISPATCHER=7
POCKET_NETWORK_REQUEST_TIMEOUT=60000
POCKET_NETWORK_MAX_SESSIONS=1000000
POCKET_NETWORK_PROVIDER_TYPE=HTTP
POCKET_NETWORK_HTTP_PROVIDER_NODE=https://node1.testnet.pokt.network:443
# Pocket account private key that has POKT to transfers proporse
POCKET_NETWORK_MAIN_FUND_ACCOUNT=
# Pocket account address that has POKT to transfers proporse
POCKET_NETWORK_MAIN_FUND_ADDRESS=
POCKET_NETWORK_AAT_VERSION=0.0.1
# Fee amount of transactions
POCKET_NETWORK_TRANSACTION_FEE=10000000
POCKET_FREE_TIER_MAX_RELAY_PER_DAY_AMOUNT=10000000
POCKET_FREE_TIER_STAKE_AMOUNT=1000000000
POCKET_NETWORK_SERVICE_WORKER_DATABASE_URL=redis://localhost:6379
POCKET_NETWORK_SERVICE_WORKER_DELAYED_START_TIME=50000
POCKET_NETWORK_SERVICE_WORKER_ATEMPTTS=15
POKT_MARKET_PRICE=0.06

# Auth Provider

JWT_SECRET_KEY=
AUTH_PROVIDER_GITHUB_CLIENT_ID=
AUTH_PROVIDER_GITHUB_CLIENT_SECRET=
AUTH_PROVIDER_GITHUB_CALLBACK_URL=http://<HOST:PORT>/api/auth/provider/github

AUTH_PROVIDER_GOOGLE_CLIENT_ID=
AUTH_PROVIDER_GOOGLE_CLIENT_SECRET=
AUTH_PROVIDER_GOOGLE_CALLBACK_URL=http://<HOST:PORT>/api/auth/provider/google

# Stripe integration
PAYMENT_DEFAULT_CLIENT_ID=
PAYMENT_DEFAULT_CLIENT_SECRET=

# Sendgrid email integration
EMAIL_API_KEY=
EMAIL_FROM=

# Recaptcha
RECAPTCHA_SERVER_SECRET=

# Check out information
CHECKOUT_DEFAULT_CURRENCY=USD
CHECKOUT_MIN_RELAYS_PER_DAY=433
CHECKOUT_MAX_RELAYS_PER_DAY=6912000
CHECKOUT_MIN_VALIDATOR_POWER=15000
CHECKOUT_MAX_VALIDATOR_POWER=1666666
CHECKOUT_BASE_RELAY_PER_POKT=0.12
CHECKOUT_STABILITY=0
CHECKOUT_SESSIONS_PER_DAY=3456
CHECKOUT_P_RATE=0.1
```

### Frontend

```
REACT_APP_BACKEND_URL=http://localhost:4200

REACT_APP_SECURE_LS_SECRET=
REACT_APP_PAYMENT_DEFAULT_CLIENT_ID=
REACT_APP_RECAPTCHA_CLIENT_KEY=

REACT_APP_STAKE_DEFAULT_STATUS=Unstake
REACT_APP_DEFAULT_MAX_RELAYS_PER_DAY=6912000

# Pocket Network
REACT_APP_POCKET_NETWORK_MAX_DISPATCHER=7
REACT_APP_POCKET_NETWORK_MAX_SESSIONS=1000000
REACT_APP_POCKET_NETWORK_REQUEST_TIMEOUT=60000
REACT_APP_POCKET_FREE_TIER_STAKE_AMOUNT=1000000000
REACT_APP_POCKET_NETWORK_DISPATCHERS=https://node1.testnet.pokt.network:443,https://node2.testnet.pokt.network:443,https://node3.testnet.pokt.network:443,https://node4.testnet.pokt.network:443,https://node5.testnet.pokt.network:443,https://node6.testnet.pokt.network:443,https://node7.testnet.pokt.network:443
REACT_APP_POCKET_NETWORK_CHAIN_ID=testnet

```

For more information visit https://docs.pokt.network

## Running the tests

### Backend

To run all tests

```
1. cd backend
2. yarn test
```

To run service tests

```
1. cd backend
2. yarn test:services
```

To run providers tests

```
1. cd backend
2. yarn test:providers
```

To run models tests

```
1. cd backend
2. yarn test:models
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/pokt-network/repo-template/blob/master/CONTRIBUTING.md) for details on contributions and the process of submitting pull requests.

## Support & Contact

<div>
  <a  href="https://twitter.com/poktnetwork" ><img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"></a>
  <a href="https://t.me/POKTnetwork"><img src="https://img.shields.io/badge/Telegram-blue.svg"></a>
  <a href="https://www.facebook.com/POKTnetwork" ><img src="https://img.shields.io/badge/Facebook-red.svg"></a>
  <a href="https://research.pokt.network"><img src="https://img.shields.io/discourse/https/research.pokt.network/posts.svg"></a>
</div>


## License

This project is licensed under the MIT License; see the [LICENSE.md](LICENSE.md) file for details.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://enriqueortiz.dev/"><img src="https://avatars.githubusercontent.com/u/26014927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Enrique Ortiz</b></sub></a><br /><a href="https://github.com/pokt-foundation/pocket-dashboard/commits?author=Evalir" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!