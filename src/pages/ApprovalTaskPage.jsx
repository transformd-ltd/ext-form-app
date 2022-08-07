import { ExclamationIcon } from "@heroicons/react/outline";

export function TaskNotAssignedWarning() {
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

export function TaskAlreadyCompletedWarning() {
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
export function Loading() {
  return (
    <div>Loading..</div>
  )
}

export default {};
