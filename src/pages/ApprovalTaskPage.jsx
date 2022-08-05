import { useEffect, useMemo, useState } from "react";
import Formatic, { Data } from "@transformd-ltd/sdk";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import get from "lodash/get";
import { ExclamationIcon } from "@heroicons/react/outline";
import ErrorBoundary from "../components/ErrorBoundary";
import API from "../API";
import axios from "axios";

function ObjectDescriptor({ value }) {
  return (
    <div>
      {Object.keys(value).map((key, i) => (
        <div key={i}>
          <b>{key}</b> : {JSON.stringify(value[key], null, 2)}
        </div>
      ))}
    </div>
  );
}
ObjectDescriptor.propTypes = {
  value: PropTypes.object,
};

function DatumDescriptor({ config, data }) {
  const type = get(data, "type");
  const value = get(data, "value");
  const span = get(config, "span", 1);
  const isObject = typeof value === "object";
  const isAbnLookup = type === "abnLookup";

  if (!data) {
    return null;
  }

  return (
    <div className={`col-span-${span}`}>
      <h5 className="text-gray-400 font-normal">{config.title}</h5>
      <div>
        {!isObject && (<div>{value}</div>)}
        {(isObject && !isAbnLookup) && (<ObjectDescriptor value={value} />)}
        {isAbnLookup && (<div dangerouslySetInnerHTML={{__html: get(data, "value.abn.details") }}></div>)}
      </div>
    </div>
  );
}
DatumDescriptor.propTypes = {
  config: PropTypes.object,
  data: PropTypes.object,
};

function DetailSection({ submission, section }) {
  const cols = get(section, "columns", 2);

  return (
    <div className="bg-white rounded-lg mb-4 shadow-sm">
      <div className="px-4 border-b py-2">
        <h4 className="leading-8 font-normal">{section.title}</h4>
      </div>
      <span className="grid-cols-4 grid-cols-2 grid-cols-3 grid-cols-1">
        {/*  Leave this here so tailwind can pick up the classnames*/}
      </span>

      <div className={`p-4 grid grid-cols-${cols} gap-2`}>
        {section.data.map((config, i) => <DatumDescriptor data={get(submission, `values.${config.id}`)} config={config} key={i}/>)}
      </div>
    </div>
  );
}
DetailSection.propTypes = {
  submission: PropTypes.object,
  section: PropTypes.object,
};

function SubmissionDetailList({ config, submission }) {
  return (
    <div className="col-span-3">
      {config.submission.map((section, i) => <DetailSection submission={submission} section={section} key={i}/>)}
    </div>
  );
}
SubmissionDetailList.propTypes = {
  submission: PropTypes.object,
  config: PropTypes.object,
};

function TaskCompletionForm(props) {
  const {
    apiUrl,
    sdkApiUrl,
    subscriptionApiUrl,
    dataHelper,
    submission,
    task,
    env,
    error,
    onRefresh
  } = props;

  const formaticProps = {
    data: dataHelper,
    apiServerUrl: apiUrl,
    serverUrl: sdkApiUrl,
    subscriptionServerUrl: subscriptionApiUrl,
    submissionIdKey: submission.id,
    formId: Number(env.FORM_ID),
    apiKey: env.API_KEY,
    environment: env.BRANCH,
    channel: env.CHANNEL,
  };

  return (
    <div className="col-span-2">
      <div className="border rounded-lg bg-white">
        <div className="px-4 border-b py-2">
          <h4 className="leading-8 font-normal">Approval<span className="text-gray-500">(required)</span></h4>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-100 p-4 rounded-lg flex justify-start gap-4">
              <ExclamationIcon className="text-red-700 w-12"/>
              <div className="">
                <h3 className="text-red-700">Validation Error</h3>
                {Object.keys(error).map(k => (<p className="text-red-800">{get(error, `${k}.0`)}</p>))}
                <div className="pt-4">
                  <button className="btn btn-primary" onClick={onRefresh}>Retry</button>
                </div>
              </div>
            </div>
          )}
          <Formatic
            {...formaticProps}
          />
        </div>
      </div>
    </div>
  );
}
TaskCompletionForm.propTypes = {
  apiUrl: PropTypes.string,
  sdkApiUrl: PropTypes.string,
  subscriptionApiUrl: PropTypes.string,
  dataHelper: PropTypes.object,
  submission: PropTypes.object,
  task: PropTypes.object,
  env: PropTypes.shape({
    FORM_ID: PropTypes.string,
    API_KEY: PropTypes.string,
    BRANCH: PropTypes.string,
    CHANNEL: PropTypes.string,
  })
};
TaskCompletionForm.defaultProps = {
  env: {
    FORM_ID: null,
    API_KEY: null,
    BRANCH: null,
    CHANNEL: null,
  }
};

function TaskNotAssignedWarning() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-red-100 p-4 rounded-lg flex justify-start gap-4">
        <ExclamationIcon className="text-red-700 w-12"/>
        <div className="">
          <h3 className="text-red-700">Task is not assigned</h3>
          <p className="text-red-800">Please assign this submission as a task before opening the URL</p>
        </div>
      </div>
    </div>
  )
}

function TaskAlreadyCompletedWarning() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-amber-100 p-4 rounded-lg flex justify-start gap-4">
        <ExclamationIcon className="text-amber-700 w-12"/>
        <div className="">
          <h3 className="text-amber-700">Assignment is already complete</h3>
          <p className="text-amber-800">Feel free to close this window</p>
        </div>
      </div>
    </div>
  )
}
function Loading() {
  return (
    <div>Loading..</div>
  )
}

function ApprovalTaskScreen(props) {
  const { task, assignment, rootAppUrl, env } = props;

  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  let navigate = useNavigate();
  const dataHelper = useMemo(() => new Data(), []);
  const params = useParams();
  const { submissionId } = params;
  const [submission, setSubmission] = useState(null);

  function handleFormComplete() {
    console.log('ApprovalTaskScreen@handleFormComplete');
    API.assignments.update(props.assignment.task.id, props.assignment.id, { current_state: "complete" })
      .then((res) => {
        console.log(res.data);
        // window.location.reload();
        handleRefresh();
      })
      .catch(err => {
        console.log('FAIL!', {err})
        setError(get(err.response, 'data.errors'));
      })
  }

  useEffect(() => {
    // todo - write about this
    const timer = setInterval(() => {
      if (dataHelper.store) {
        clearInterval(timer);
        console.log('ApprovalTaskScreen@addCompleteHelper', { dataHelper });
        dataHelper.getEmitter().on("SessionComplete", handleFormComplete);
      }
    }, 1000);
  }, []);

  function handleRefresh() {
    console.log('handleRefresh');
    // navigate(0);
    props.onComplete();
    // navigate("../success", { replace: true });
  }

  useEffect(() => {
    console.log('ApprovalTaskScreen@loadConfig.json');
    axios
      .get(`${rootAppUrl}/config.json`)
      .then(res => setConfig(res.data));

    API.submissions.retrieve(submissionId)
      .then((res) => setSubmission(res.data))
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!config || !submission) {
    return <Loading/>;
  }

  if (!assignment) {
    return <TaskNotAssignedWarning/>;
  }

  if (assignment.current_state === "complete") {
    return <TaskAlreadyCompletedWarning/>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-screen-xl	h-full px-8 mx-auto ">
        <div className="leading-8 py-6">
          <h2>{config.title}</h2>
        </div>

        <div className="grid grid-cols-5 h-full gap-6">
          <SubmissionDetailList
            config={config}
            submission={submission}
          />

          <TaskCompletionForm
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
        </div>
      </div>
    </ErrorBoundary>
  );
}
ApprovalTaskScreen.propTypes = {
  task: PropTypes.object,
  assignment: PropTypes.object,
  env: PropTypes.object,
  apiUrl: PropTypes.string,
  rootAppUrl: PropTypes.string,
  sdkApiUrl: PropTypes.string,
  subscriptionApiUrl: PropTypes.string,
};
ApprovalTaskScreen.defaultProps = {
  rootAppUrl: "",
};

export default ApprovalTaskScreen;
