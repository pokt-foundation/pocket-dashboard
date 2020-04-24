import React, {Component} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Alert, Button, Col, Modal, Row, Badge} from "react-bootstrap";
import InfoCard from "../../../core/components/InfoCard/InfoCard";
import HelpLink from "../../../core/components/HelpLink";
import {NETWORK_TABLE_COLUMNS, BONDSTATUS} from "../../../constants";
import "./AppDetail.scss";
import ApplicationService, {
  PocketApplicationService,
} from "../../../core/services/PocketApplicationService";
import NetworkService from "../../../core/services/PocketNetworkService";
import Loader from "../../../core/components/Loader";
import {_getDashboardPath, DASHBOARD_PATHS} from "../../../_routes";
import DeletedOverlay from "../../../core/components/DeletedOverlay/DeletedOverlay";
import {copyToClickboard, formatNumbers} from "../../../_helpers";

class AppDetail extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      pocketApplication: {},
      networkData: {},
      chains: [],
      aat: {},
      loading: true,
      showDeleteModal: false,
      deleted: false,
    };

    this.deleteApplication = this.deleteApplication.bind(this);
    this.unstakeApplication = this.unstakeApplication.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line react/prop-types
    const {address} = this.props.match.params;

    const {
      pocketApplication,
      networkData,
    } = await ApplicationService.getApplication(address);

    const chains = await NetworkService.getNetworkChains(networkData.chains);

    const {freeTier} = pocketApplication;

    let aat;

    if (freeTier) {
      aat = await ApplicationService.getFreeTierAppAAT(
        pocketApplication.publicPocketAccount.address
      );
    }

    this.setState({
      pocketApplication,
      networkData,
      chains,
      aat,
      loading: false,
    });
  }

  async deleteApplication() {
    const {address} = this.state.networkData;

    const success = await ApplicationService.deleteAppFromDashboard(address);

    if (success) {
      this.setState({deleted: true});
    }
  }

  async unstakeApplication() {
    const {address} = this.state.networkData;
    const {freeTier} = this.state.pocketApplication;

    if (freeTier) {
      const success = await ApplicationService.unstakeFreeTierApplication(
        address
      );

      if (success) {
        // TODO: Show message on frontend about success
      }
    } else {
      // TODO: Integrate unstake for custom tier apps
    }
  }

  render() {
    const {
      name,
      url,
      contactEmail,
      owner,
      description,
      icon,
      freeTier,
    } = this.state.pocketApplication;
    const {
      jailed,
      max_relays,
      staked_tokens,
      status,
      public_key,
      address,
    } = this.state.networkData;

    const {chains, aat, loading, showDeleteModal, deleted} = this.state;

    const generalInfo = [
      {title: `${formatNumbers(staked_tokens)} POKT`, subtitle: "Stake tokens"},
      {title: BONDSTATUS[status], subtitle: "Stake status"},
      {title: formatNumbers(max_relays), subtitle: "Max Relays"},
    ];

    const contactInfo = [
      {title: url, subtitle: "URL"},
      {title: contactEmail, subtitle: "Email"},
    ];

    let aatStr = "";

    if (freeTier) {
      aatStr = PocketApplicationService.parseAAT(aat);
    }

    if (loading) {
      return <Loader />;
    }

    if (deleted) {
      return (
        <DeletedOverlay
          text="You application was succesfully removed"
          buttonText="Go to apps list"
          buttonLink={_getDashboardPath(DASHBOARD_PATHS.apps)}
        />
      );
    }

    return (
      <div id="app-detail">
        <Row>
          <Col>
            <div className="head">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={icon} className="mr-3" />
              <div className="info">
                <h1 className="name d-flex align-items-center">
                  {name}
                  {freeTier && (
                    <Badge variant="primary" className="ml-2 pl-3 pr-3">
                      Free Tier
                    </Badge>
                  )}
                </h1>
                <p className="owner mb-1">{owner}</p>
                <p className="description">{description}</p>
              </div>
            </div>
          </Col>
        </Row>
        <h1 className="mt-4">GENERAL INFORMATION</h1>
        <Row className="mt-2 stats">
          {generalInfo.map((card, idx) => (
            <Col key={idx}>
              <InfoCard title={card.title} subtitle={card.subtitle} />
            </Col>
          ))}
          <Col>
            <InfoCard title={jailed === 1 ? "YES" : "NO"} subtitle={"Jailed"}>
              {/*eslint-disable-next-line jsx-a11y/anchor-is-valid*/}
              <a className="link" href="#">
                Take out of jail
              </a>
            </InfoCard>
          </Col>
        </Row>
        <Row className="contact-info stats">
          {contactInfo.map((card, idx) => (
            <Col key={idx}>
              <InfoCard
                className="pl-4"
                title={card.title}
                subtitle={card.subtitle}
              >
                <span></span>
              </InfoCard>
            </Col>
          ))}
        </Row>
        <Row className="mt-3">
          <Col lg={freeTier ? 6 : 12} md={freeTier ? 6 : 12}>
            <div className="info-section">
              <h3>Address</h3>
              <Alert variant="light">{address}</Alert>
            </div>
            <div className="info-section">
              <h3>Public Key</h3>
              <Alert variant="light">{public_key}</Alert>
            </div>
          </Col>
          {freeTier && (
            <Col lg="6" md="6">
              <div id="aat-info" className="mb-2">
                <h3>AAT</h3>
                <span>
                  <HelpLink size="2x" />
                  <p>How to create an AAT?</p>
                </span>
              </div>
              <Alert variant="light" className="aat-code">
                <pre>
                  <code className="language-html" data-lang="html">
                    {"# Returns\n"}
                    <span id="aat">{aatStr}</span>
                  </code>
                  <p
                    onClick={() =>
                      copyToClickboard(JSON.stringify(aat, null, 2))
                    }
                  >
                    Copy
                  </p>
                </pre>
              </Alert>
            </Col>
          )}
        </Row>
        <Row>
          <Col>
            <h3>Networks</h3>
            <BootstrapTable
              classes="app-table"
              keyField="hash"
              data={chains}
              columns={NETWORK_TABLE_COLUMNS}
              bordered={false}
            />
          </Col>
        </Row>
        <Row className="mt-3 mb-4">
          <Col className="action-buttons">
            <div className="main-options">
              <Button
                onClick={this.unstakeApplication}
                variant="dark"
                className="pr-4 pl-4"
              >
                Unstake
              </Button>
              <Button variant="secondary" className="ml-3 pr-4 pl-4">
                New Purchase
              </Button>
            </div>
            <Button
              onClick={() => this.setState({showDeleteModal: true})}
              variant="link"
              className="link mt-3"
            >
              Delete App
            </Button>
          </Col>
        </Row>

        <Modal
          show={showDeleteModal}
          onHide={() => this.setState({showDeleteModal: false})}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Are you sure you want to delete this App?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This action is irreversible, if you delete it you will never be able
            to access it again
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              className="pr-4 pl-4"
              onClick={this.deleteApplication}
            >
              Delete
            </Button>
            <Button
              variant="dark"
              className="pr-4 pl-4"
              onClick={() => this.setState({showDeleteModal: false})}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default AppDetail;
