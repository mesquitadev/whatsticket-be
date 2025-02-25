// @ts-nocheck
import Company from "../../models/Company";
import Plan from "../../models/Plan";

const ShowPlanCompanyService = async (
  id: string | number
): Promise<Company> => {
  return Company.findOne({
    where: { id },
    attributes: [
      "id",
      "name",
      "email",
      "status",
      "dueDate",
      "createdAt",
      "phone"
    ],
    order: [["name", "ASC"]],
    include: [
      {
        model: Plan,
        as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "value",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi",
          "useKanban",
          "useOpenAi",
          "useIntegrations"
        ]
      }
    ]
  });
};

export default ShowPlanCompanyService;
