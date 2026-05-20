const { BrokerProduct, BrokerBenefit } = require("../models");

export class ProductCatalogRepository {
  async findAllActiveWithBenefits() {
    return await BrokerProduct.findAll({
      where: { is_active: true },
      include: [
        {
          model: BrokerBenefit,
          as: "benefits",
        },
      ],
    });
  }

  async findById(productId: string) {
    return await BrokerProduct.findByPk(productId, {
      include: [
        {
          model: BrokerBenefit,
          as: "benefits",
        },
      ],
    });
  }
}
