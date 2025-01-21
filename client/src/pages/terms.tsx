import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="mt-4 text-lg text-gray-600">
            Please read our terms and conditions carefully
          </p>
        </div>

        <Card>
          <CardContent className="p-6 prose prose-gray max-w-none">
            <ol className="list-decimal space-y-6">
              <li className="text-gray-700">
                All fragile and breakable items should be stored in Styrofoam or protected with wooden pallets. 
                We don't offer refund for broken items since we don't know at what stage of transportation it got 
                broken so your supplier should package them securely with Styrofoam or wooden pallets.
              </li>

              <li className="text-gray-700">
                Our warehouse issue receipt for goods sent to the warehouse. Kindly ask your supplier to send 
                you a copy of the receipt to confirm your goods have been duly received please.
              </li>

              <li className="text-gray-700">
                Your supplier should print your full shipping mark on your package so you receive regular 
                updates please.
              </li>

              <li className="text-gray-700">
                It is recommended you ask your supplier to send you pictures of your package showing your 
                shipping mark to be sure they printed your shipping mark on the package.
              </li>

              <li className="text-gray-700">
                We don't provide compensation for items below 0.03 cbm when they get missing. For packages 
                that are 0.03 cbm and above, we refund the full cost of the content of the package but not 
                exceeding 3 times the shipping cost payable.
              </li>

              <li className="text-gray-700">
                Office number: 0303955950. Monday to Friday. 9am to 4pm.
              </li>

              <li className="text-gray-700">
                Join our telegram channel: <a href="https://t.me/shipwithmsg" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">t.me/shipwithmsg</a>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
