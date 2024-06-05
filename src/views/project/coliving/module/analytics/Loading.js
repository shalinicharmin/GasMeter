import React from "react";
import Skeleton from "react-loading-skeleton";
import { Row, Col } from "reactstrap";

function Loading() {
  return (
    <>
      <h3 className="mb-2">
        <Skeleton width={200} />
      </h3>
      <Row>
        <Col md="6" xs="12" lg="4" className="">
          <Skeleton height={80} className="mb-1" />
        </Col>
        <Col md="6" xs="12" lg="4" className="">
          <Skeleton height={80} className="mb-1" />
        </Col>
        <Col md="6" xs="12" lg="4" className="">
          <Skeleton height={80} className="mb-1" />
        </Col>
      </Row>
    </>
  );
}

export default Loading;
