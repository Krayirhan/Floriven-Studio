import { describe, expect, it } from "vitest";
import type { ProductBlueprint } from "./product-blueprint";

describe("ProductBlueprint", () => {
  it("keeps product structure independent from visual style", () => {
    const blueprint: ProductBlueprint = {
      productDomain: "freelance-project-finance",
      audience: "Yaratıcı profesyoneller",
      entities: ["project", "client", "invoice", "payment"],
      capabilities: ["projectTracking", "invoiceTracking"],
      contentVocabulary: ["proje", "müşteri", "fatura", "ödeme"],
      screens: [
        { id: "overview", name: "Genel Bakış", route: "/genel-bakis", purpose: "Öncelikleri görür", sections: ["Gelir", "Teslimler"], role: "overview", priority: "primary", navigationPlacement: "primary" },
      ],
      navigation: { primaryScreenIds: ["overview"], utilityScreenIds: [] },
      screenPolicy: { requestedCount: 1, minCount: 1, maxCount: 1, rationale: "Tek ekran istendi" },
    };
    expect(JSON.stringify(blueprint)).not.toContain("serene-health");
    expect(JSON.stringify(blueprint)).not.toContain("editorial-culture");
  });
});
