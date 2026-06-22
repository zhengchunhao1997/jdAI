import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { id: "jidah-demo" },
    update: {},
    create: {
      id: "jidah-demo",
      name: "即答 AI客服",
      publicName: "即答 AI客服",
      websiteUrl: "https://jidah.ai",
      adminEmail: "admin@jidah.ai",
      welcomeMessage:
        "你好，我是即答 AI客服的售前顾问。你可以问我功能、价格、接入渠道、人工接管和试用方式。",
      handoffMessage: "已收到，人工顾问会继续为你处理。你也可以留下微信或手机号，方便我们联系。",
      businessHours: "周一至周日 9:00-22:00",
      contactInfo: "请在体验版中留下微信或手机号",
    },
  });

  console.log(`Seeded merchant: ${merchant.id}`);

  const knowledgeItems = [
    {
      title: "产品核心能力",
      category: "产品介绍",
      question: "即答 AI客服能做什么？",
      answer:
        "即答 AI客服可以 7x24 小时接待售前咨询，基于企业知识库回答问题，识别高意向线索，遇到报价、合同、退款等复杂问题时转人工，并沉淀未命中问题。",
    },
    {
      title: "接入渠道",
      category: "渠道接入",
      question: "即答 AI客服支持哪些渠道？",
      answer:
        "第一版优先支持网站聊天窗口体验，后续可根据企业接口条件接入企业微信、公众号、小程序、小红书、抖音等渠道。",
    },
    {
      title: "价格说明",
      category: "商务报价",
      question: "即答 AI客服怎么收费？",
      answer:
        "价格会根据每日咨询量、接入渠道、知识库规模、是否需要人工接管和后台功能范围评估。涉及具体报价时建议转人工确认。",
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.upsert({
      where: { id: `seed-${item.title}` },
      update: {
        category: item.category,
        question: item.question,
        answer: item.answer,
        enabled: true,
      },
      create: {
        id: `seed-${item.title}`,
        merchantId: merchant.id,
        ...item,
      },
    });
  }

  console.log(`Seeded knowledge items: ${knowledgeItems.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
