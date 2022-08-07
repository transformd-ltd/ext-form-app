import React, { useState, useEffect, useMemo } from "react";
import Formatic, {Data} from "@transformd-ltd/sdk";
import axios from "axios";
import get from "lodash/get";
import API from "../API";
import {useParams} from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {Loading, TaskAlreadyCompletedWarning, TaskNotAssignedWarning} from "./ApprovalTaskPage";

function FullscreenForm(props) {
  const {
    apiUrl,
    sdkApiUrl,
    subscriptionApiUrl,
    dataHelper,
    submission,
    task,
    env,
    error,
    channel,
    onRefresh
  } = props;

  const formaticProps = {
    data: dataHelper,
    apiServerUrl: apiUrl,
    serverUrl: sdkApiUrl,
    subscriptionServerUrl: subscriptionApiUrl,
    submissionId: submission.id,
    formId: Number(env.FORM_ID),
    apiKey: env.API_KEY,
    environment: env.BRANCH,
    channel: channel,
  };
  console.log({ formaticProps });


  return (
    <Formatic
      {...formaticProps}
    />
  )

}

export default function FormEmbedPage(props) {
  const { task, assignment, rootAppUrl, env } = props;
  const params = useParams();
  const [submission, setSubmission] = useState(null);
  const dataHelper = useMemo(() => new Data(), []);
  const [error, setError] = useState(null);

  console.log('FormEmbedPage', { params });

  useEffect(() => {
    if (!params.submissionId) {
      return;
    }

    API.submissions.retrieve(params.submissionId)
      .then((res) => setSubmission(res.data))
      .catch((err) => {
        console.error(err);
      });
  }, [params]);

  const channel = get(params, 'channel', 'master');

  function handleRefresh() {
    props.onComplete();
  }

  if (!submission) {
    return (
      <div>
        <Loading/>
      </div>
    )
    return <Loading/>;
  }

  if (!assignment) {
    return <TaskNotAssignedWarning/>;
  }

  if (assignment.current_state === "complete") {
    return <TaskAlreadyCompletedWarning/>;
  }

  return (
    <div className="max-w-7xl	m-auto px-8">
      <ErrorBoundary>
        <h3>Form</h3>
        <FullscreenForm
          key={channel}
          channel={channel}
          dataHelper={dataHelper}
          submission={submission}
          task={task}
          env={env}
          error={error}
          onRefresh={handleRefresh}
          apiUrl={props.apiUrl}
          sdkApiUrl={props.sdkApiUrl}
          subscriptionApiUrl={props.subscriptionApiUrl}
        />
      </ErrorBoundary>
    </div>
  )
}
