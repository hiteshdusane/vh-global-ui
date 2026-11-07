import { Leaf } from "lucide-react";
import CocopeatProduction from "./CocopeatProduction";

type Specification = { parameter: string; value: string; note?: string };

const productProfile: Specification[] = [
  { parameter: "Product", value: "Cocopeat", note: "Coconut-based growing media" },
  { parameter: "Material", value: "Coconut coir pith" },
  { parameter: "Applications", value: "Nurseries, horticulture, and modern agriculture" },
  { parameter: "Product selection", value: "Discuss your crop, growing setup, and required quantity" },
];

// Indicative specifications provided and updated by the user; final values are confirmed per order.
const technicalSpecs: Specification[] = [
  { parameter: "Expansion volume", value: "More than 16 L per kg", note: "Indicative hydrated volume" },
  { parameter: "Particle size", value: "0.5–6 mm" },
  { parameter: "Electrical conductivity (EC)", value: "< 0.5 dS/m", note: "1:5 v/v test method" },
  { parameter: "pH", value: "5.5–6.5" },
  { parameter: "Moisture content", value: "Available on request", note: "Percentage by weight" },
  { parameter: "Impurities", value: "< 2%" },
];

function SpecificationTable({ rows, caption }: { rows: Specification[]; caption: string }) {
  return (
    <table className="specs-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr><th scope="col">Parameter</th><th scope="col">VHN Global cocopeat</th></tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.parameter}>
            <th scope="row">{row.parameter}{row.note && <span className="specs-row-note">{row.note}</span>}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CocopeatExpertise() {
  return (
    <section id="cocopeat-expertise" className="space-y-6" aria-labelledby="expertise-heading">
      <div className="glass-panel feature-card p-6 sm:p-9">
        <span className="section-label">Our cocopeat expertise</span>
        <h2 id="expertise-heading" className="text-3xl sm:text-4xl font-bold mb-4">Know your cocopeat.</h2>
        <p className="text-gray-500 leading-relaxed max-w-3xl">Explore coconut-based growing media for nurseries, horticulture, and modern agriculture, with product details, indicative technical specifications, and a closer look at the production process.</p>
        <a href="#technical-specifications" className="company-text-link mt-4">View technical specifications</a>
      </div>

      <section id="product-profile" className="glass-panel feature-card specs-panel" aria-labelledby="profile-heading">
        <div className="specs-panel-heading"><Leaf className="specs-heading-icon" aria-hidden="true" /><div><span className="section-label">Product profile</span><h3 id="profile-heading" className="text-2xl sm:text-3xl font-bold">Our cocopeat, at a glance.</h3></div></div>
        <SpecificationTable rows={productProfile} caption="VHN Global cocopeat product profile" />
      </section>

      <section id="technical-specifications" className="glass-panel feature-card specs-panel" aria-labelledby="technical-heading">
        <div className="specs-panel-heading"><h3 id="technical-heading" className="text-2xl sm:text-3xl font-bold">Cocopeat Technical Specifications</h3></div>
        <SpecificationTable rows={technicalSpecs} caption="Indicative cocopeat technical specifications" />
        <p className="px-4 sm:px-8 py-5 text-sm text-gray-500 leading-relaxed">Specifications are indicative. Final values and test details are confirmed for your selected product before ordering.</p>
      </section>

      <CocopeatProduction />
    </section>
  );
}
