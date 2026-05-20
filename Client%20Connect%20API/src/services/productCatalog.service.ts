import { ProductCatalogRepository } from "../repositories/productCatalog.repository";
import { PricingHelper } from "../utils/pricingHelper";

const productCatalogRepo = new ProductCatalogRepository();

export class ProductCatalogService {
  async getProductList() {
    const productList = await productCatalogRepo.findAllActiveWithBenefits();

    return productList.map((product: any) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      description: product.description,
      benefits: product.benefits.map((benefit: any) => ({
        benefit_id: benefit.benefit_id,
        benefit_name: benefit.benefit_name,
        benefit_type: benefit.benefit_type,
        is_mandatory: benefit.is_mandatory,
        is_embedded: benefit.is_embedded,
        default_cover_amount: benefit.default_cover_amount,
      })),
    }));
  }

  async calculatePricing(data: any) {
    return await PricingHelper.calculateQuotePricing(data);
  }
}
