import {BadgeCheckIcon} from "@heroicons/react/outline";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-blue-100 p-4 rounded-lg flex justify-start gap-4">
        <BadgeCheckIcon className="text-blue-700 w-12"/>
        <div>
          <h3 className="text-blue-700">Approvals App</h3>
          <p className="text-blue-800">Please navigate to this application using a deeplink.</p>
        </div>
      </div>
    </div>
  );
}
