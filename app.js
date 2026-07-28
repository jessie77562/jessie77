const STORAGE_KEY = "meno_assessment_state_v1";

const assessmentGroups = [
  { id: "all", label: "全部" },
  { id: "boneNutrition", label: "骨骼营养" },
  { id: "body", label: "运动体重" },
  { id: "sleepMood", label: "睡眠情绪" },
  { id: "cognition", label: "认知" }
];

const assessmentCatalog = [
  { id: "osteoporosis", icon: "BO", title: "骨质疏松评估", category: "骨健康", group: "boneNutrition", minutes: "3 分钟", effect: "识别骨折、跌倒、早绝经等骨质疏松风险信号，帮助判断是否需要骨密度检查。", focus: ["骨健康", "骨折", "骨质疏松"] },
  { id: "vitaminD", icon: "VD", title: "维生素D缺乏评估", category: "营养风险", group: "boneNutrition", minutes: "3 分钟", effect: "结合日晒、饮食、补充剂和肌肉骨骼表现，判断是否需要关注维生素D摄入。", focus: ["营养", "维生素 D", "维生素D", "钙", "骨健康"] },
  { id: "exercise", icon: "EX", title: "运动能力评估", category: "运动能力", group: "body", minutes: "4 分钟", effect: "评估耐力、力量和平衡能力，帮助制定更适合围绝经期的运动管理重点。", focus: ["运动量不足", "运动", "疲劳"] },
  { id: "abdominalFat", icon: "AF", title: "腹部脂肪堆积评估", category: "体脂代谢", group: "body", minutes: "3 分钟", effect: "关注腰围、体重变化和代谢风险，帮助识别需要优先管理的腹型肥胖信号。", focus: ["体重", "腹部脂肪", "腰围", "代谢", "血糖", "血脂"] },
  { id: "sleep", icon: "PS", title: "匹兹堡睡眠评估", category: "睡眠质量", group: "sleepMood", minutes: "5 分钟", effect: "从入睡、睡眠时长、夜醒和日间影响判断睡眠质量，辅助解释疲劳、情绪和记忆波动。", focus: ["睡眠", "失眠", "疲劳", "夜醒"] },
  { id: "depression", icon: "DP", title: "抑郁自评", category: "情绪心理", group: "sleepMood", minutes: "3 分钟", effect: "识别持续低落、兴趣下降和功能受影响情况，帮助判断是否需要进一步情绪支持。", focus: ["情绪", "低落", "严重情绪"] },
  { id: "anxiety", icon: "AN", title: "焦虑评估", category: "情绪心理", group: "sleepMood", minutes: "3 分钟", effect: "识别过度担忧、紧张和身体化反应，帮助区分压力、睡眠和围绝经期症状影响。", focus: ["焦虑", "紧张", "担忧"] },
  { id: "memory", icon: "EM", title: "记忆力下降评估（EMQ-R）", category: "认知记忆", group: "cognition", minutes: "5 分钟", effect: "记录日常遗忘、注意力和执行功能困扰，帮助结合睡眠与情绪判断认知波动来源。", focus: ["注意力", "疲劳", "记忆", "认知"] }
];

const symptomItems = [
  ["hotFlush", "潮热、出汗或夜间盗汗", "somatic"],
  ["heart", "心悸、胸闷或心前区不适", "somatic"],
  ["sleep", "入睡困难、易醒或早醒", "psychological"],
  ["lowMood", "情绪低落、兴趣下降", "psychological"],
  ["irritable", "易烦躁、易怒", "psychological"],
  ["anxiety", "紧张、担忧或焦虑", "psychological"],
  ["fatigue", "疲劳、注意力下降", "psychological"],
  ["sexualProblems", "性生活疼痛或满意度下降", "urogenital"],
  ["bladder", "尿频、尿急或漏尿", "urogenital"],
  ["vaginalDryness", "阴道干涩、灼热或不适", "urogenital"],
  ["jointPain", "关节或肌肉酸痛", "somatic"]
];

const state = loadState();
let route = "dashboard";
let reportReturnRoute = "dashboard";
let wizardStep = 0;
let activeDeepAssessmentId = null;
let deepStep = 0;
let activeAssessmentGroup = "all";

const deepAssessments = {
  osteoporosis: {
    title: "骨质疏松风险判定",
    description: "通过 5 步问卷快速查看当前骨健康风险，并同步给出骨质疏松风险提示。",
    note: "",
    chips: [],
    resultKicker: "骨质疏松风险筛查",
    countLabel: "题阳性",
    resultBands: [
      {
        min: 5,
        className: "is-high",
        level: "你属于骨质疏松高关注人群",
        summary: "根据本次问卷，你出现了多个骨质疏松相关风险因素，提示未来低骨量、骨质疏松或骨折风险较高。建议尽快到正规医疗机构进行专业评估，并与医生讨论是否需要骨密度检查及后续管理。",
        cta: "尽快安排评估",
        tip: "若近期曾因轻微跌倒或轻微碰撞发生骨折，请优先就医。骨质疏松会增加轻微跌倒或碰撞后骨折的风险。",
        recommendations: ["建议尽早前往医院骨质疏松门诊或内分泌科。", "可与医生讨论是否需要进行双能X线吸收法（DXA）骨密度检测。", "整理近期跌倒史、骨折史、用药史、绝经情况和家族史。"]
      },
      {
        min: 3,
        max: 4,
        className: "is-medium",
        level: "你存在较多骨健康风险信号",
        summary: "根据本次问卷，你已出现较多骨质疏松相关风险因素。围绝经期女性在激素变化阶段更需要关注骨量流失。建议你尽快与医生讨论，评估是否需要进行骨密度检查或进一步骨折风险评估。",
        cta: "了解下一步检查",
        tip: "问卷结果仅提示风险，不代表确诊。",
        recommendations: ["建议把骨密度检查或骨折风险评估提上日程。", "关注身高变化、跌倒风险和轻微碰撞后的疼痛。", "开始重视负重运动、抗阻训练和防跌倒。"]
      },
      {
        min: 1,
        max: 2,
        className: "is-medium",
        level: "你已有部分骨质疏松风险因素",
        summary: "根据本次问卷，你存在部分骨质疏松相关风险因素。虽然这不等于已经患病，但说明你值得更早开始关注骨健康。建议从现在起重视负重运动、抗阻训练、日常防跌倒，并注意钙、蛋白质和维生素D的摄入。",
        cta: "查看改善建议",
        tip: "如果后续新增风险因素，建议尽早咨询医生。",
        recommendations: ["保持规律运动，优先加入抗阻和平衡训练。", "注意钙、蛋白质和维生素D摄入。", "持续关注身高变化、跌倒和骨折相关信号。"]
      },
      {
        min: 0,
        max: 0,
        className: "is-low",
        level: "当前未见明显骨健康风险信号",
        summary: "根据本次问卷，你目前未勾选明显的骨质疏松相关风险因素。这是一个积极信号，但不代表未来没有风险。围绝经期是骨量变化的重要阶段，建议继续保持规律运动、均衡饮食、充足钙和维生素D摄入，并持续关注身高变化和月经/绝经情况。",
        cta: "继续了解骨健康",
        tip: "本问卷用于风险筛查，不能替代骨密度检查或医生诊断。",
        recommendations: ["继续保持健康的生活方式。", "保持均衡饮食、充足日照和规律运动。", "建议定期复测骨健康风险。"]
      }
    ],
    keyPrompts: [
      {
        id: "adultFragilityFracture",
        text: "成年后轻微跌倒/碰撞就骨折：这是一项需要优先重视的骨折风险信号，建议尽快就医评估骨密度和骨折风险。骨质疏松常表现为轻微跌倒或碰撞后骨折。"
      },
      {
        id: "parentHipFracture",
        text: "父母有骨质疏松或轻微跌倒后骨折：家族史提示你可能有更高的骨健康风险，建议把骨密度评估提上日程。中国研究中，父母脆性骨折史与更高风险等级相关。"
      }
    ],
    steps: [
      {
        title: "家族与年龄",
        subtitle: "先看看家族史和基础年龄相关风险。",
        questions: [
          ["parentHipFracture", "父母曾被诊断有骨质疏松或曾在轻摔后骨折？"],
          ["hunchedBack", "父母中一人有驼背？"],
          ["ageOver40", "实际年龄超过40岁？"]
        ]
      },
      {
        title: "骨折、跌倒与体型",
        subtitle: "继续查看骨折、跌倒、身高和 BMI 相关信号。",
        questions: [
          ["adultFragilityFracture", "是否成年后因为轻摔后发生骨折？"],
          ["fallConcern", "是否经常摔倒（去年超过一次），或因为身体较虚弱而担心摔倒？"],
          ["heightLoss", "40岁后的身高是否减少超过3cm以上？"],
          ["lowBmi", "是否体质量过轻（BMI值少于19kg/m²）？"]
        ]
      },
      {
        title: "用药与疾病",
        subtitle: "这些疾病和用药史可能增加骨质疏松风险。",
        questions: [
          ["steroidUse", "是否曾服用类固醇激素（例如可的松、泼尼松）连续超过3个月？"],
          ["rheumatoid", "是否患有类风湿关节炎？"],
          ["relatedDisease", "是否被诊断出有甲状腺功能亢进、甲状旁腺功能亢进、1型糖尿病、克罗恩病或乳糜泻等胃肠疾病，或营养不良？"]
        ]
      },
      {
        title: "生活方式与营养",
        subtitle: "这些日常习惯会影响骨健康管理。",
        questions: [
          ["heavyAlcohol", "是否经常大量饮酒（每天饮用超过两单位的乙醇，相当于啤酒500mL、葡萄酒150mL或烈性酒50mL）？"],
          ["smoking", "目前习惯吸烟，或曾经吸烟？"],
          ["exerciseLess30", "每天运动量少于30分钟（包括做家务、走路和跑步等）？"],
          ["noDairyNoCalcium", "是否不能食用乳制品，又没有服用钙片？"],
          ["sunlightLess10", "每天从事户外活动时间少于10分钟，又没有服用维生素D？"]
        ]
      },
      {
        title: "女性特异风险",
        subtitle: "最后确认绝经和卵巢相关风险。",
        questions: [
          ["earlyMenopause", "是否在45岁或以前就停经？"],
          ["amenorrhea12", "除了怀孕、绝经或子宫切除外，是否曾停经超过12个月？"],
          ["ovaryBefore50", "是否在50岁前切除卵巢又没有服用雌/孕激素补充剂？"]
        ]
      }
    ]
  },
  vitaminD: {
    title: "维生素D缺乏风险评估",
    description: "通过日晒、饮食、补充剂和骨肌肉表现，快速判断维生素D缺乏相关风险。",
    note: "该评测用于围绝经期营养与骨健康管理参考，不能替代血液检测或医生诊断。",
    chips: ["已带入 年龄 45岁", "已带入 所在城市", "已带入 饮食记录"],
    resultKicker: "营养风险提示",
    resultLevels: ["维生素D缺乏风险较高", "维生素D摄入需关注", "暂未发现明显缺乏风险"],
    resultSummaries: [
      "本次评估命中多项维生素D缺乏相关信号，建议结合饮食、日晒和必要检测进一步确认。",
      "本次评估发现部分维生素D不足风险，建议优先调整日晒与饮食习惯。",
      "本次评估暂未提示明显风险，建议继续保持规律户外活动和均衡饮食。"
    ],
    recommendations: [
      ["可咨询医生是否需要检测 25(OH)D 水平。", "记录每周户外日晒时间和膳食来源。", "不要自行长期大剂量补充维生素D。"],
      ["增加安全日晒和富含维生素D/钙的食物来源。", "与骨健康、运动评估结果一起查看。", "建议 3 个月后复测。"],
      ["保持户外活动和均衡饮食。", "围绝经期仍建议定期关注骨健康。", "如出现肌无力或骨痛，可提前复测。"]
    ],
    steps: [
      {
        title: "日晒暴露",
        subtitle: "先看皮肤接受阳光照射的机会是否充足。",
        questions: [
          ["vdSunLess20", "您平均每天在阳光下暴露皮肤（不涂防晒、不打伞）的时间是否少于 20 分钟？"],
          ["vdStrictSunBlock", "您出门是否习惯全身涂抹防晒霜，或使用长袖、遮阳帽、遮阳伞等严密物理遮挡？"],
          ["vdIndoorMost", "您的工作或日常生活是否绝大部分时间都在室内？"]
        ]
      },
      {
        title: "饮食吸收与体型",
        subtitle: "继续查看摄入、吸收和体型相关因素。",
        questions: [
          ["vdFoodLess", "您是否很少食用深海鱼（如三文鱼、鲭鱼）、蛋黄或动物肝脏？"],
          ["vdBmiOver28", "您的 BMI 是否超过 28（即体重(kg) / 身高(m)的平方）？"],
          ["vdMalabsorption", "您是否有慢性腹泻、胆囊疾病或长期胆汁淤积问题（影响脂肪吸收）？"],
          ["vdDarkerSkin", "与同龄人相比，您的肤色是否属于较深的那一类？"]
        ]
      },
      {
        title: "身体表现",
        subtitle: "这些表现可能提示需要进一步关注维生素D状态。",
        questions: [
          ["vdMusclePain", "您是否经常感到腰背部隐痛、全身肌肉酸痛或下肢沉重乏力？"],
          ["vdLegCramps", "在夜间或受凉后，您是否容易出现腿部抽筋？"],
          ["vdFatigueMood", "您近期是否感到容易疲劳、情绪低落或有难以解释的焦虑？"],
          ["vdBrittleNails", "您的指甲是否变脆、容易劈裂？"]
        ]
      }
    ]
  },
  exercise: {
    title: "运动能力评估",
    description: "从耐力、力量、平衡和日常活动受限情况，评估当前运动能力状态。",
    note: "该评测用于制定生活方式管理重点，若运动中胸痛、明显气促或头晕，应优先就医。",
    chips: ["已带入 年龄 45岁", "已带入 近7天步数", "已带入 运动记录"],
    resultKicker: "运动能力提示",
    resultLevels: ["运动能力明显需关注", "运动能力有待提升", "运动能力状态较稳"],
    resultSummaries: [
      "本次评估提示耐力、力量或平衡方面存在较多受限信号，建议从低强度、可持续活动开始。",
      "本次评估发现部分运动能力短板，可优先建立规律运动节奏。",
      "本次评估暂未提示明显运动能力受限，建议继续保持。"
    ],
    recommendations: [
      ["建议先选择步行、拉伸和平衡训练。", "如运动中胸痛或气促，应停止并咨询医生。", "每周记录运动频率、时长和不适。"],
      ["逐步达到每周 150 分钟中等强度活动。", "加入抗阻和平衡训练。", "和骨健康评估结果一起看。"],
      ["保持规律运动。", "增加肌力和平衡训练可帮助长期骨健康。", "建议按月复盘运动记录。"]
    ],
    steps: [
      {
        title: "日常活动",
        subtitle: "先了解日常活动是否受限。",
        questions: [
          ["exWalkSlow", "连续快走 10 分钟是否明显吃力?"],
          ["exStairsHard", "上一层楼是否明显气喘或腿软?"],
          ["exSitStandHard", "从椅子上起身是否需要扶手?"],
          ["exAvoid", "是否因为担心不适而回避运动?"]
        ]
      },
      {
        title: "力量与平衡",
        subtitle: "继续看看跌倒和肌力相关信号。",
        questions: [
          ["exFall", "近 6 个月是否跌倒过?"],
          ["exBalance", "单脚站立或转身时是否容易不稳?"],
          ["exPain", "运动后是否经常关节痛或肌肉痛超过 2 天?"],
          ["exNoRoutine", "是否没有固定的每周运动习惯?"]
        ]
      }
    ]
  },
  depression: {
    title: "抑郁自评",
    description: "通过近期情绪、兴趣、精力和睡眠变化，初步了解抑郁相关困扰。",
    note: "该评测仅用于情绪健康自我观察；如有伤害自己的想法，请立即寻求专业帮助。",
    chips: ["已带入 睡眠记录", "已带入 情绪记录", "已带入 周期阶段"],
    resultKicker: "情绪风险提示",
    resultLevels: ["抑郁风险需尽快关注", "抑郁情绪需关注", "暂未发现明显抑郁风险"],
    resultSummaries: [
      "本次评估命中多项情绪低落和功能受影响信号，建议尽快寻求专业支持。",
      "本次评估发现部分抑郁情绪相关信号，建议连续记录并关注变化。",
      "本次评估暂未提示明显抑郁风险，但围绝经期情绪会随睡眠和周期波动。"
    ],
    recommendations: [
      ["如有自伤想法，请立即联系身边的人并寻求专业帮助。", "建议咨询心理/精神专科或妇科更年期门诊。", "记录睡眠、情绪和压力事件。"],
      ["连续 2 周记录情绪、睡眠和兴趣变化。", "优先改善睡眠和规律活动。", "若影响工作生活，建议咨询专业人士。"],
      ["保持规律作息和社交支持。", "若后续出现明显低落，可提前复测。", "可与焦虑评估一起查看。"]
    ],
    steps: [
      {
        title: "情绪与兴趣",
        subtitle: "看看最近两周的情绪变化。",
        questions: [
          ["dpLowMood", "是否经常感到情绪低落、空虚或想哭?"],
          ["dpInterest", "是否对平时喜欢的事情明显失去兴趣?"],
          ["dpWorthless", "是否经常自责或觉得自己没有价值?"],
          ["dpHopeless", "是否明显感到无望或提不起劲?"]
        ]
      },
      {
        title: "功能影响",
        subtitle: "继续了解睡眠、精力和日常影响。",
        questions: [
          ["dpSleep", "是否出现持续失眠或睡很多仍疲惫?"],
          ["dpFatigue", "是否经常精力不足、做事困难?"],
          ["dpWork", "情绪是否已经影响工作、家庭或社交?"],
          ["dpSelfHarm", "是否出现伤害自己的想法?"]
        ]
      }
    ]
  },
  anxiety: {
    title: "焦虑评估",
    description: "从担忧、紧张、身体反应和回避行为，了解近期焦虑困扰。",
    note: "该评测用于健康管理参考；若出现惊恐发作、胸痛或无法控制的焦虑，请及时求助。",
    chips: ["已带入 睡眠记录", "已带入 压力记录", "已带入 潮热记录"],
    resultKicker: "焦虑风险提示",
    resultLevels: ["焦虑风险较高", "焦虑状态需关注", "暂未发现明显焦虑风险"],
    resultSummaries: [
      "本次评估命中多项焦虑相关信号，可能已经影响生活或身体感受。",
      "本次评估发现部分紧张担忧相关信号，建议持续观察触发因素。",
      "本次评估暂未提示明显焦虑风险，建议继续关注睡眠和压力变化。"
    ],
    recommendations: [
      ["记录焦虑触发场景、持续时间和身体反应。", "如伴随胸痛、濒死感或呼吸困难，应优先排除急症。", "建议咨询心理/精神专科或更年期门诊。"],
      ["尝试规律呼吸训练、运动和睡眠管理。", "连续 2 周记录担忧内容和频率。", "如影响日常生活，建议进一步咨询。"],
      ["保持规律作息和运动。", "压力增加或睡眠变差时可提前复测。", "可与抑郁自评一起查看。"]
    ],
    steps: [
      {
        title: "担忧与紧张",
        subtitle: "先看看焦虑核心感受。",
        questions: [
          ["anWorry", "是否经常控制不住地担心很多事?"],
          ["anTense", "是否经常感到紧绷、坐立不安?"],
          ["anIrritable", "是否明显更易烦躁或易怒?"],
          ["anFear", "是否经常突然害怕会发生不好的事?"]
        ]
      },
      {
        title: "身体反应",
        subtitle: "焦虑也可能表现为身体不适。",
        questions: [
          ["anPalpitation", "是否经常心慌、胸闷或呼吸不顺?"],
          ["anSleep", "担忧是否影响入睡或易醒?"],
          ["anAvoid", "是否因为担心而回避外出、社交或工作?"],
          ["anPanic", "是否出现过突发强烈恐惧或惊恐感?"]
        ]
      }
    ]
  },
  memory: {
    title: "记忆力下降评估（EMQ-R）",
    description: "参考日常记忆错误场景，了解近期遗忘、注意力和执行功能困扰。",
    note: "该评测用于自我观察，不等同于认知障碍诊断；睡眠、情绪和压力都会影响记忆表现。",
    chips: ["已带入 睡眠记录", "已带入 情绪状态", "已带入 年龄 45岁"],
    resultKicker: "认知记忆提示",
    resultLevels: ["记忆困扰较明显", "记忆状态需关注", "暂未发现明显记忆困扰"],
    resultSummaries: [
      "本次评估命中多项日常记忆错误信号，建议结合睡眠、情绪和压力情况一起观察。",
      "本次评估发现部分记忆或注意力困扰，建议记录高发场景。",
      "本次评估暂未提示明显记忆困扰，建议保持睡眠和压力管理。"
    ],
    recommendations: [
      ["记录遗忘发生频率、场景和是否影响工作生活。", "优先改善睡眠和焦虑/抑郁相关因素。", "若进展明显或影响安全，建议咨询医生。"],
      ["使用备忘录、清单和固定收纳位置。", "减少多任务切换，给重要事项设置提醒。", "2-4 周后复测观察变化。"],
      ["保持规律睡眠、运动和社交活动。", "压力或睡眠波动时可提前复测。", "可与焦虑、抑郁评估一起查看。"]
    ],
    steps: [
      {
        title: "日常遗忘",
        subtitle: "参考 EMQ-R 常见生活场景。",
        questions: [
          ["memNames", "是否经常想不起熟人的名字或称呼?"],
          ["memItems", "是否经常忘记物品放在哪里?"],
          ["memTasks", "是否经常忘记原本打算要做的事?"],
          ["memWords", "说话时是否经常卡住，想不起词?"]
        ]
      },
      {
        title: "注意与执行",
        subtitle: "继续看看注意力和计划执行。",
        questions: [
          ["memFocus", "是否经常读完一段内容却不记得意思?"],
          ["memRepeat", "是否经常重复问同一个问题或重复做同一件事?"],
          ["memPlan", "是否更难安排步骤或处理复杂任务?"],
          ["memAffect", "记忆问题是否已经影响工作、家庭或安全?"]
        ]
      }
    ]
  },
  sleep: {
    title: "匹兹堡睡眠评估",
    description: "参考匹兹堡睡眠质量评估的核心维度，了解近 1 个月睡眠质量和日间影响。",
    note: "该评测用于睡眠健康管理参考，不替代睡眠医学诊断；若长期严重失眠或呼吸暂停，应咨询医生。",
    chips: ["已带入 睡眠记录", "已带入 夜醒记录", "已带入 情绪状态"],
    resultKicker: "睡眠质量提示",
    resultLevels: ["睡眠问题较明显", "睡眠质量需关注", "睡眠状态相对稳定"],
    resultSummaries: [
      "本次评估命中多项睡眠质量受影响信号，可能已影响日间精力、情绪或记忆表现。",
      "本次评估发现部分睡眠质量问题，建议优先观察入睡、夜醒和日间困倦。",
      "本次评估暂未提示明显睡眠质量问题，建议继续保持稳定作息。"
    ],
    recommendations: [
      ["连续记录 2 周入睡时间、夜醒次数和白天困倦程度。", "减少睡前咖啡因、酒精和长时间刷屏。", "若伴随憋醒、打鼾明显或白天嗜睡，建议咨询睡眠门诊。"],
      ["固定起床时间，避免过长午睡。", "把潮热盗汗、焦虑和夜醒放在一起记录。", "2-4 周后复测观察变化。"],
      ["保持规律作息和适度运动。", "围绝经期睡眠易受潮热和情绪影响，变化时可提前复测。", "可与焦虑、抑郁评估一起查看。"]
    ],
    steps: [
      {
        title: "睡眠质量",
        subtitle: "先查看入睡和夜间睡眠连续性。",
        questions: [
          ["psqiSleepLatency", "近 1 个月是否经常入睡超过 30 分钟?"],
          ["psqiNightWake", "是否每周多次夜间醒来或早醒后难再入睡?"],
          ["psqiHotFlush", "是否因潮热、盗汗或心慌影响睡眠?"],
          ["psqiShortSleep", "平均每晚实际睡眠是否少于 6 小时?"]
        ]
      },
      {
        title: "日间影响",
        subtitle: "继续了解睡眠对第二天状态的影响。",
        questions: [
          ["psqiDaySleepy", "白天是否经常困倦、打盹或注意力下降?"],
          ["psqiEnergy", "是否因为睡眠不好影响工作、家务或社交?"],
          ["psqiMedicine", "是否经常需要借助助眠药物或保健品入睡?"],
          ["psqiSnore", "是否有人提醒你打鼾明显、憋醒或呼吸暂停?"]
        ]
      }
    ]
  },
  abdominalFat: {
    title: "腹部脂肪堆积评估",
    description: "从腰围、体重变化、饮食运动和代谢指标，了解腹型肥胖与代谢风险信号。",
    note: "该评测用于生活方式管理参考，不输出疾病诊断；如已有血糖、血脂或血压异常，应结合医生建议管理。",
    chips: ["已带入 身高体重", "已带入 经期阶段", "已带入 运动记录"],
    resultKicker: "体脂代谢提示",
    resultLevels: ["腹部脂肪与代谢风险需重点关注", "腹部脂肪管理需关注", "暂未发现明显腹部脂肪风险"],
    resultSummaries: [
      "本次评估命中多项腹部脂肪堆积或代谢风险信号，建议优先管理腰围、饮食结构和运动习惯。",
      "本次评估发现部分腹部脂肪管理信号，建议从腰围记录和规律运动开始。",
      "本次评估暂未提示明显腹部脂肪风险，建议继续保持体重、腰围和代谢指标监测。"
    ],
    recommendations: [
      ["建议记录腰围、体重和每周运动量。", "优先减少含糖饮料、精制主食和久坐时间。", "如血糖、血脂或血压异常，建议咨询医生。"],
      ["每周固定时间测量腰围。", "增加抗阻训练和中等强度有氧运动。", "与睡眠、情绪和运动能力评估一起查看。"],
      ["保持均衡饮食和规律活动。", "围绝经期体脂分布可能变化，建议每月复盘腰围。", "如体重或腰围持续上升，可提前复测。"]
    ],
    steps: [
      {
        title: "腰围与体重变化",
        subtitle: "先查看腹部脂肪堆积的直观信号。",
        questions: [
          ["afWaistHigh", "腰围是否明显增加，或裤腰比过去更紧?"],
          ["afWeightGain", "近 6 个月体重是否增加超过 3 公斤?"],
          ["afBelly", "是否主要胖在腹部、腰腹赘肉更明显?"],
          ["afPostMeal", "餐后是否更容易困倦或腹胀?"]
        ]
      },
      {
        title: "代谢与生活方式",
        subtitle: "继续了解饮食、运动和代谢相关信号。",
        questions: [
          ["afSitLong", "每天久坐时间是否超过 6 小时?"],
          ["afSugar", "是否经常喝含糖饮料或吃甜食、夜宵?"],
          ["afLowExercise", "每周中等强度运动是否少于 150 分钟?"],
          ["afMetabolic", "是否有血压、血糖、血脂偏高或脂肪肝提示?"]
        ]
      }
    ]
  }
};

const steps = [
  {
    title: "隐私授权",
    kicker: "开始前",
    render: renderConsentStep
  },
  {
    title: "基础信息",
    kicker: "分期评测",
    render: renderProfileStep
  },
  {
    title: "经期数据",
    kicker: "周期变化",
    render: renderMenstrualStep
  },
  {
    title: "症状严重度",
    kicker: "症状评测",
    render: renderSymptomsStep
  },
  {
    title: "全量健康",
    kicker: "风险与生活方式",
    render: renderHealthStep
  },
  {
    title: "就医准备",
    kicker: "红旗提示",
    render: renderCareStep
  }
];

function defaultState() {
  return {
    consent: false,
    draft: {},
    deepAnswers: {},
    biometrics: {},
    reports: [],
    demoRetestSeeded: false,
    demoRetestSeedVersion: 0,
    periodHistory: [
      { date: "2026-02-08", cycleLength: 30, periodDays: 5 },
      { date: "2026-03-12", cycleLength: 32, periodDays: 5 },
      { date: "2026-04-20", cycleLength: 39, periodDays: 6 },
      { date: "2026-06-04", cycleLength: 45, periodDays: 5 }
    ],
    lastReportId: null
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const defaults = defaultState();
    const merged = { ...defaults, ...stored, biometrics: { ...defaults.biometrics, ...(stored?.biometrics || {}) } };
    if (Number(merged.demoRetestSeedVersion || 0) < 2) {
      const assessedIds = new Set(
        merged.reports
          .filter((report) => getReportType(report) === "deep")
          .map((report) => report.assessmentId)
      );
      const demoAssessment = assessmentCatalog.find((item) => !assessedIds.has(item.id)) || assessmentCatalog[1];
      merged.reports = [...merged.reports, createRetestDemoReport(demoAssessment, 2)];
      merged.demoRetestSeeded = true;
      merged.demoRetestSeedVersion = 2;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    const fallback = defaultState();
    fallback.reports.push(createRetestDemoReport(assessmentCatalog[1], 2));
    fallback.demoRetestSeeded = true;
    fallback.demoRetestSeedVersion = 2;
    return fallback;
  }
}

function createRetestDemoReport(assessment, seedVersion = 1) {
  const completedAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `demo_retest_v${seedVersion}_${assessment.id}`,
    type: "deep",
    assessmentId: assessment.id,
    title: assessment.title,
    category: assessment.category,
    completedAt,
    retestAt: addDays(completedAt, 30).toISOString(),
    dataSource: "专项测评问卷",
    resultBadge: "状态较稳",
    resultClass: "is-low",
    level: "上次测评状态较稳",
    summary: "上次测评暂未提示明显风险，可通过复测持续关注身体变化。",
    cta: "建议再次测评",
    tip: "该记录为“可复测”状态演示数据。",
    yesCount: 0,
    countLabel: "项风险",
    recommendations: ["保持规律生活方式。", "继续记录相关变化。", "建议再次测评。"],
    keyPrompts: [],
    answers: []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function navigate(nextRoute) {
  route = nextRoute;
  document.body.dataset.route = nextRoute;
  updateAppNav();
  if (nextRoute !== "wizard") {
    activeDeepAssessmentId = null;
    $("#wizardView")?.classList.remove("deep-assessment-view");
  }
  $all(".view").forEach((view) => view.classList.remove("is-visible"));
  const target = $(`#${nextRoute}View`);
  if (target) target.classList.add("is-visible");
  $all(".tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.route === nextRoute);
  });
  render();
}

function updateAppNav() {
  const backButton = $(".app-nav .nav-icon");
  const title = $(".app-nav strong");
  const historyButton = $(".app-nav .nav-link");
  if (!backButton) return;
  const backRoute = route === "report" ? reportReturnRoute : "dashboard";
  const label = backRoute === "history" ? "返回我的测评" : "返回测评首页";
  backButton.dataset.route = backRoute;
  backButton.setAttribute("aria-label", label);
  backButton.setAttribute("title", label);
  if (historyButton) historyButton.hidden = route === "history";
  if (title) {
    title.textContent = {
      report: "详情",
      history: "我的测评",
      assessments: "更多测评",
      wizard: "测评中心"
    }[route] || "测评中心";
  }
}

function render() {
  renderDashboard();
  renderAssessmentLists();
  renderHistory();
  renderPrivacy();
  if (route === "report") renderReport();
}

function getLatestReport() {
  if (!state.reports.length) return null;
  return state.reports.find((report) => report.id === state.lastReportId) || state.reports[0];
}

function getLatestFullReport() {
  return state.reports.find((report) => getReportType(report) === "full") || null;
}

function getLatestDeepReport(assessmentId) {
  return state.reports.find(
    (report) => getReportType(report) === "deep" && report.assessmentId === assessmentId
  ) || null;
}

function getReportType(report) {
  return report?.type || "full";
}

function renderDashboard() {
  renderAssessmentTabs($("#assessmentTabs"));
  renderAssessmentCards($("#assessmentPreview"), getFilteredAssessments(getSortedAssessments()));
}

function renderAssessmentLists() {
  renderAssessmentTabs($("#assessmentLibraryTabs"));
  renderAssessmentCards($("#assessmentLibrary"), getFilteredAssessments(getSortedAssessments()));
}

function renderAssessmentTabs(container) {
  if (!container) return;
  container.innerHTML = assessmentGroups
    .map(
      (group) => `
        <button class="assessment-tab ${activeAssessmentGroup === group.id ? "is-active" : ""}" type="button" data-action="set-assessment-tab" data-group="${group.id}" aria-selected="${activeAssessmentGroup === group.id}">
          ${group.label}
        </button>
      `
    )
    .join("");
  bindDynamicActions(container);
}

function getFilteredAssessments(items) {
  if (activeAssessmentGroup === "all") return items;
  return items.filter((item) => item.group === activeAssessmentGroup);
}

function getAssessmentStatus(item, entryReport, deepReport) {
  if (deepReport && isReadyForRetest(deepReport.completedAt)) {
    return { text: "可复测", icon: "↻", className: "status-retest", cardClass: "is-retest" };
  }
  if (entryReport && getFocusScore(item, entryReport) > 0) {
    return { text: "需关注", icon: "!", className: "status-risk", cardClass: "is-risk" };
  }
  if (!deepReport) {
    return { text: "未测评", icon: "○", className: "status-pending", cardClass: "is-pending" };
  }
  return { text: "", icon: "", className: "", cardClass: "is-complete", ariaText: "近期已测评" };
}

function isReadyForRetest(completedAt) {
  const completedTime = new Date(completedAt).getTime();
  if (Number.isNaN(completedTime)) return false;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - completedTime > thirtyDays;
}

function getSortedAssessments() {
  const report = getLatestFullReport();
  return [...assessmentCatalog].sort((a, b) => {
    const focusDiff = getFocusScore(b, report) - getFocusScore(a, report);
    if (focusDiff !== 0) return focusDiff;
    return assessmentCatalog.findIndex((item) => item.id === a.id) - assessmentCatalog.findIndex((item) => item.id === b.id);
  });
}

function getFocusScore(item, report) {
  if (!report) return 0;
  const context = [report.primaryConcern, report.stage?.label, report.stage?.detail, ...(report.redFlags || []), ...(report.riskTags || [])].join(" ");
  const keywordScore = item.focus.filter((keyword) => context.includes(keyword)).length;
  const psychologicalScore = report.symptomScores?.psychological || 0;
  const totalScore = report.symptomScores?.total || 0;
  const extraScore = {
    depression: psychologicalScore >= 8 || context.includes("情绪") ? 1 : 0,
    anxiety: psychologicalScore >= 8 || context.includes("焦虑") ? 1 : 0,
    memory: totalScore >= 18 || psychologicalScore >= 8 ? 1 : 0,
    sleep: psychologicalScore >= 6 || context.includes("睡眠") ? 1 : 0,
    abdominalFat: context.includes("血压") || context.includes("血糖") || context.includes("血脂") ? 1 : 0,
    vitaminD: context.includes("骨健康") ? 1 : 0,
    exercise: context.includes("疲劳") ? 1 : 0
  }[item.id] || 0;
  return keywordScore + extraScore;
}

function renderAssessmentCards(container, items) {
  const report = getLatestFullReport();
  container.innerHTML = items
    .map((item) => {
      const deepReport = getLatestDeepReport(item.id);
      const status = getAssessmentStatus(item, report, deepReport);
      const cardClass = status.cardClass || "is-pending";
      return `
        <article class="assessment-card ${cardClass}" role="button" tabindex="0" data-action="start-deep" data-id="${item.id}" aria-label="${item.title}，${status.text || status.ariaText}">
          <div class="assessment-card-main">
            <h3>${item.title}</h3>
            <p class="muted">${item.category} · ${item.minutes}</p>
            <p class="assessment-effect">${item.effect}</p>
            ${
              status.text
                ? `<div class="card-meta">
                    <span class="tag status-pill ${status.className}">
                      <i aria-hidden="true">${status.icon}</i>${status.text}
                    </span>
                  </div>`
                : ""
            }
          </div>
          <div class="assessment-visual assessment-visual-${item.id}" aria-hidden="true"><span></span><i></i><b></b></div>
        </article>
      `;
    })
    .join("");
  bindDynamicActions(container);
}

function renderPrivacy() {
  const input = $("#consentInput");
  if (input) input.checked = Boolean(state.consent);
}

function renderHistory() {
  const container = $("#historyList");
  if (!state.reports.length) {
    container.innerHTML = `
      <article class="notice-panel">
        <h2>暂无测评报告</h2>
        <p>完成一次评测后，报告会自动沉淀在这里。</p>
      </article>
    `;
    bindDynamicActions(container);
    return;
  }
  container.innerHTML = state.reports
    .map((report) => renderHistoryItem(report))
    .join("");
  bindDynamicActions(container);
}

function renderHistoryItem(report) {
  const isDeepReport = getReportType(report) === "deep";
  const title = isDeepReport ? report.title : "围绝经期综合评测";
  const visualId = isDeepReport ? report.assessmentId || "default" : "full";
  const resultText = escapeHtml(
    isDeepReport
      ? report.level || report.resultBadge || "查看测评详情"
      : report.healthLevel || report.stage?.label || "查看测评详情"
  );
  return `
    <article class="history-item history-assessment-card" role="button" tabindex="0" data-action="open-report" data-id="${report.id}" aria-label="${title}，测评结果 ${resultText}，测评时间 ${formatDateTime(report.completedAt)}">
      <div class="history-assessment-main">
        <h3>${title}</h3>
        <p class="history-assessment-result"><span>测评结果：</span>${resultText}</p>
        <p>测评时间：${formatDateTime(report.completedAt)}</p>
      </div>
      <div class="assessment-visual assessment-visual-${visualId}" aria-hidden="true"><span></span><i></i><b></b></div>
    </article>
  `;
}

function startWizard() {
  activeDeepAssessmentId = null;
  wizardStep = state.consent ? 1 : 0;
  $("#wizardView").classList.remove("deep-assessment-view");
  navigate("wizard");
  renderWizard();
}

function startDeepAssessment(assessmentId) {
  activeDeepAssessmentId = assessmentId;
  deepStep = 0;
  $("#wizardView").classList.add("deep-assessment-view");
  navigate("wizard");
  renderDeepAssessment();
}

function renderWizard() {
  activeDeepAssessmentId = null;
  $("#wizardView").classList.remove("deep-assessment-view");
  const step = steps[wizardStep];
  $("#wizardTitle").textContent = step.title;
  $("#stepKicker").textContent = step.kicker;
  $("#stepCounter").textContent = `${wizardStep + 1}/${steps.length}`;
  $("#stepProgress").style.width = `${((wizardStep + 1) / steps.length) * 100}%`;
  $("#prevStep").disabled = wizardStep === 0;
  $("#prevStep").textContent = "上一步";
  $("#nextStep").textContent = wizardStep === steps.length - 1 ? "生成报告" : "下一步";
  $("#assessmentForm").innerHTML = step.render();
  bindFormInputs();
}

function renderDeepAssessment() {
  const config = getDeepAssessmentConfig(activeDeepAssessmentId);
  const step = config.steps[deepStep];
  $("#wizardTitle").textContent = config.title;
  $("#stepKicker").textContent = "评估进度";
  $("#stepCounter").textContent = `步骤 ${deepStep + 1} / ${config.steps.length}`;
  $("#stepProgress").style.width = `${((deepStep + 1) / config.steps.length) * 100}%`;
  $("#prevStep").disabled = false;
  $("#prevStep").textContent = "上一步";
  $("#nextStep").textContent = deepStep === config.steps.length - 1 ? "生成结果" : "下一步";
  $("#assessmentForm").innerHTML = `
    <div class="deep-progress-head">
      <span>评估进度</span>
      <span>步骤 ${deepStep + 1} / ${config.steps.length}</span>
    </div>
    <div class="deep-progress"><span style="width:${((deepStep + 1) / config.steps.length) * 100}%"></span></div>
    <article class="deep-intro-card">
      <h1>${config.title}</h1>
      <p>${config.description}</p>
      ${config.note ? `<p>${config.note}</p>` : ""}
      ${deepStep === 0 ? renderDeepBiometrics() : ""}
    </article>
    <section class="deep-section-head">
      <h2>${step.title}</h2>
      <p>${step.subtitle}</p>
    </section>
    <div class="deep-question-list">
      ${step.questions.map(([id, question]) => renderDeepQuestion(id, question)).join("")}
    </div>
  `;
  bindFormInputs();
}

function renderDeepBiometrics() {
  const height = state.draft.height || state.biometrics?.height || "";
  const weight = state.draft.weight || state.biometrics?.weight || "";
  const bmi = getBmi({ height, weight });
  return `
    <section class="deep-biometrics" aria-labelledby="deepBiometricsTitle">
      <div class="deep-biometrics-heading">
        <h2 id="deepBiometricsTitle">身体数据</h2>
        <span>用于 BMI 计算</span>
      </div>
      <div class="deep-biometrics-grid">
        <label class="deep-biometric-field">
          <span>身高</span>
          <span class="deep-biometric-input">
            <input name="height" type="number" min="120" max="210" step="0.1" inputmode="decimal" value="${height}" placeholder="请输入" aria-label="身高，单位厘米" />
            <b>cm</b>
          </span>
        </label>
        <label class="deep-biometric-field">
          <span>体重</span>
          <span class="deep-biometric-input">
            <input name="weight" type="number" min="35" max="140" step="0.1" inputmode="decimal" value="${weight}" placeholder="请输入" aria-label="体重，单位千克" />
            <b>kg</b>
          </span>
        </label>
        <div class="deep-bmi-card" aria-live="polite">
          <span>BMI</span>
          <strong id="deepBmiValue">${bmi ? bmi.toFixed(1) : "--"}</strong>
          <small id="deepBmiLevel">${bmi ? getBmiLevel(bmi) : "填写后自动计算"}</small>
        </div>
      </div>
    </section>
  `;
}

function renderDeepResult(savedResult) {
  const config = getDeepAssessmentConfig(activeDeepAssessmentId);
  const result = savedResult || getDeepResult(config);
  renderTemplateDeepResult(config, result);
}

function getGenericDeepResultHtml(config, result, completedAt = "") {
  return `
    <article class="deep-final-card ${result.className}">
      <div class="deep-final-badge">${getDeepResultBadge(result)}</div>
      <h1>${config.title}</h1>
      ${renderReportCompletedAt(completedAt)}
      <h2>${result.level}</h2>
      <p>${result.summary}</p>
      <strong class="deep-final-action">${result.cta}</strong>
      ${renderDeepResultExplanation()}
      <div class="deep-metric-grid">
        ${renderDeepMetricCards(result, config)}
      </div>
      <section class="deep-reminder-section">
        <h3>重点提醒</h3>
        <ul>
          ${getDeepReminderItems(result).map((item) => `<li>${getReminderText(item)}</li>`).join("")}
        </ul>
      </section>
    </article>
  `;
}

function renderTemplateDeepResult(config, result) {
  $("#wizardTitle").textContent = `${config.title}结果`;
  $("#stepKicker").textContent = "评估完成";
  $("#stepCounter").textContent = "结果";
  $("#stepProgress").style.width = "100%";
  $("#prevStep").disabled = false;
  $("#prevStep").textContent = "重新评估";
  $("#nextStep").textContent = "返回";
  $("#assessmentForm").innerHTML = getTemplateDeepResultHtml(config, result, "", activeDeepAssessmentId);
}

function getTemplateDeepResultHtml(config, result, completedAt = "", assessmentId = "") {
  return `
    <article class="deep-final-card osteoporosis-report deep-template-report ${result.className}">
      <header class="osteoporosis-report-head">
        <h1>${config.title}</h1>
        ${renderReportCompletedAt(completedAt)}
      </header>

      <section class="osteoporosis-section osteoporosis-conclusion-card">
        <div class="osteoporosis-conclusion-head">
          <div class="osteoporosis-risk-mark risk-level-${getTemplateRiskLevel(result, assessmentId)}">
            <span>${getTemplateRiskIcon(result, assessmentId)}</span>
          </div>
          <p class="osteoporosis-result-title">${result.level}</p>
        </div>
        <p>${result.summary}</p>
        ${renderTemplatePriorityAlert(result, assessmentId)}
      </section>

      <section class="osteoporosis-section osteoporosis-plain-section">
        <h2>综合建议</h2>
        <ul class="osteoporosis-advice-list">
          ${result.recommendations.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <p class="osteoporosis-disclaimer">${getTemplateDisclaimer(config, assessmentId)}</p>
    </article>
  `;
}

function renderReportCompletedAt(completedAt) {
  if (!completedAt) return "";
  return `<p class="report-completed-at">测评时间：${formatDateTime(completedAt)}</p>`;
}

function getTemplateRiskLevel(result, assessmentId) {
  if (assessmentId === "osteoporosis") {
    if (result.yesCount >= 5) return 4;
    if (result.yesCount >= 3) return 3;
    if (result.yesCount >= 1) return 2;
    return 1;
  }
  if (result.className === "is-high") return 4;
  if (result.className === "is-medium") return 2;
  return 1;
}

function getTemplateRiskIcon(result, assessmentId) {
  const level = getTemplateRiskLevel(result, assessmentId);
  return ["低", "中", "较高", "高"][level - 1];
}

function renderTemplatePriorityAlert(result, assessmentId) {
  const prompts = (result.keyPrompts || []).map(normalizePromptItem).filter(Boolean);
  const prompt =
    assessmentId === "osteoporosis"
      ? prompts.find((item) => getPromptId(item) === "adultFragilityFracture")
      : prompts[0];
  if (!prompt) return "";
  if (assessmentId !== "osteoporosis") {
    return `
      <div class="osteoporosis-priority-alert">
        <strong>重点风险提示</strong>
        <p>${getReminderText(prompt)}</p>
      </div>
    `;
  }
  return `
    <div class="osteoporosis-priority-alert">
      <strong>成年后轻微跌倒/碰撞就骨折</strong>
      <p>这是一项需要优先重视的骨折风险信号，建议尽快就医评估骨密度和骨折风险。骨质疏松常表现为轻微跌倒或碰撞后骨折。</p>
    </div>
  `;
}

function getTemplateDisclaimer(config, assessmentId) {
  if (assessmentId === "osteoporosis") {
    return "本问卷用于风险筛查，不能替代骨密度检查或医生诊断。";
  }
  return config.note || "本问卷用于健康风险筛查和健康管理参考，不能替代医生诊断、检查或治疗建议。";
}

function getPromptId(item) {
  if (typeof item === "string") {
    if (item.startsWith("成年后轻微跌倒/碰撞就骨折")) return "adultFragilityFracture";
    if (item.startsWith("父母有骨质疏松或轻微跌倒后骨折")) return "parentHipFracture";
    return "";
  }
  return item?.id || "";
}

function normalizePromptItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: getPromptId(item), text: item };
  return item;
}

function renderDeepResultExplanation() {
  if (activeDeepAssessmentId !== "osteoporosis") return "";
  return `
    <section class="deep-result-explanation">
      <h3>结果说明</h3>
      <p>若近期曾因轻微跌倒或轻微碰撞发生骨折，请优先就医。骨质疏松会增加轻微跌倒或碰撞后骨折的风险。</p>
    </section>
  `;
}

function getDeepResultBadge(result) {
  if (result.className === "is-high") return "建议尽快做专业评估";
  if (result.className === "is-medium") return "建议尽早关注";
  return "建议继续保持";
}

function renderDeepMetricCards(result, config) {
  if (activeDeepAssessmentId === "osteoporosis") {
    return `
      <div class="deep-metric-card">
        <span>OSTA 指数</span>
        <strong>2.0</strong>
        <p>低风险</p>
      </div>
      <div class="deep-metric-card">
        <span>IOF 阳性项</span>
        <strong>${result.yesCount}</strong>
        <p>${result.className === "is-high" ? "建议尽快做专业评估" : "建议持续关注"}</p>
      </div>
      <div class="deep-metric-card">
        <span>BMI</span>
        <strong>21.5</strong>
        <p>BMI 参考范围内</p>
      </div>
    `;
  }
  return `
    <div class="deep-metric-card">
      <span>阳性项</span>
      <strong>${result.yesCount}</strong>
      <p>${result.countLabel}</p>
    </div>
    <div class="deep-metric-card">
      <span>评估项目</span>
      <strong>${config.steps.length}</strong>
      <p>组问题</p>
    </div>
    <div class="deep-metric-card">
      <span>建议</span>
      <strong>${result.className === "is-low" ? "低" : "高"}</strong>
      <p>${getDeepResultBadge(result)}</p>
    </div>
  `;
}

function getDeepReminderItems(result) {
  if (result.keyPrompts.length) return result.keyPrompts;
  return result.recommendations;
}

function getDeepResult(config) {
  const questionIds = config.steps.flatMap((step) => step.questions.map(([id]) => id));
  const yesCount = questionIds.filter((id) => state.deepAnswers?.[id] === "yes").length;
  const highAt = Math.max(5, Math.ceil(questionIds.length * 0.6));
  const mediumAt = Math.max(2, Math.ceil(questionIds.length * 0.25));
  const kicker = config.resultKicker || "健康风险提示";
  const keyPrompts = (config.keyPrompts || [])
    .filter((item) => state.deepAnswers?.[item.id] === "yes")
    .map((item) => ({ id: item.id, text: item.text }));
  if (config.resultBands) {
    const band = config.resultBands.find((item) => yesCount >= item.min && (item.max == null || yesCount <= item.max)) || config.resultBands[config.resultBands.length - 1];
    return {
      yesCount,
      kicker,
      keyPrompts,
      countLabel: config.countLabel || "项风险信号",
      className: band.className,
      level: band.level,
      summary: band.summary,
      cta: band.cta,
      tip: band.tip,
      recommendations: band.recommendations
    };
  }
  if (yesCount >= highAt) {
    return {
      yesCount,
      kicker,
      keyPrompts,
      countLabel: config.countLabel || "项风险信号",
      className: "is-high",
      level: config.resultLevels?.[0] || "风险偏高",
      summary: config.resultSummaries?.[0] || "本次评估命中多项风险信号，建议进一步关注。",
      cta: "查看建议",
      tip: "本评测用于健康管理参考，不能替代医生诊断。",
      recommendations: config.recommendations?.[0] || ["建议进一步咨询专业人士。", "记录相关症状和变化。", "按计划复测。"]
    };
  }
  if (yesCount >= mediumAt) {
    return {
      yesCount,
      kicker,
      keyPrompts,
      countLabel: config.countLabel || "项风险信号",
      className: "is-medium",
      level: config.resultLevels?.[1] || "需关注",
      summary: config.resultSummaries?.[1] || "本次评估发现部分风险信号，建议持续观察。",
      cta: "查看建议",
      tip: "本评测用于健康管理参考，不能替代医生诊断。",
      recommendations: config.recommendations?.[1] || ["建议连续记录变化。", "结合相关评测一起查看。", "可在 3 个月后复测。"]
    };
  }
  return {
    yesCount,
    kicker,
    keyPrompts,
    countLabel: config.countLabel || "项风险信号",
    className: "is-low",
    level: config.resultLevels?.[2] || "暂未发现明显风险",
    summary: config.resultSummaries?.[2] || "本次评估暂未提示明显风险，建议保持长期管理。",
    cta: "查看建议",
    tip: "本评测用于健康管理参考，不能替代医生诊断。",
    recommendations: config.recommendations?.[2] || ["保持规律生活方式。", "继续记录相关变化。", "建议按计划定期复测。"]
  };
}

function getDeepAssessmentConfig(assessmentId) {
  if (deepAssessments[assessmentId]) return deepAssessments[assessmentId];
  const item = assessmentCatalog.find((assessment) => assessment.id === assessmentId) || assessmentCatalog[0];
  return {
    title: item.title,
    description: "通过分步问卷快速查看当前健康风险，并同步给出管理建议。",
    note: "该评测用于健康管理参考，不作为疾病诊断、治疗方案或用药建议。",
    chips: ["已带入 年龄 45岁", "已带入 身高 160cm", "已带入 体重 55kg"],
    steps: deepAssessments.osteoporosis.steps
  };
}

function renderDeepQuestion(id, question) {
  const value = state.deepAnswers?.[id] || "";
  return `
    <article class="deep-question-card">
      <h3>${question}</h3>
      <div class="deep-options">
        <label class="${value === "yes" ? "is-selected" : ""}">
          <input type="radio" name="deep_${id}" value="yes" ${value === "yes" ? "checked" : ""} />
          是
        </label>
        <label class="${value === "no" ? "is-selected" : ""}">
          <input type="radio" name="deep_${id}" value="no" ${value === "no" ? "checked" : ""} />
          否
        </label>
      </div>
    </article>
  `;
}

function renderConsentStep() {
  return `
    <div class="form-grid">
      <div class="field full">
        <h2>授权后继续评测</h2>
        <p class="muted">评测会使用基础健康信息、经期记录和问卷答案生成健康管理报告。结果不替代医生诊断，不提供用药方案。</p>
      </div>
      <label class="check check-row field full">
        <input type="checkbox" name="consent" ${state.consent ? "checked" : ""} />
        <span></span>
        我已了解并同意用于围绝经期健康评测与档案管理
      </label>
    </div>
  `;
}

function renderProfileStep() {
  const d = state.draft;
  return `
    <div class="form-grid">
      ${numberField("age", "年龄", d.age, "岁", 35, 65)}
      ${numberField("height", "身高", d.height, "cm", 120, 210)}
      ${numberField("weight", "体重", d.weight, "kg", 35, 140)}
      ${selectField("surgery", "卵巢/子宫相关手术史", d.surgery, [
        ["none", "无"],
        ["uterus", "子宫切除"],
        ["ovary", "卵巢切除或卵巢功能受损"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("pregnancy", "近期妊娠或哺乳", d.pregnancy, [
        ["no", "否"],
        ["pregnant", "可能妊娠/已妊娠"],
        ["lactation", "哺乳期"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("hormoneUse", "近期激素类药物使用", d.hormoneUse, [
        ["no", "否"],
        ["yes", "是"],
        ["unknown", "不确定"],
        ["skip", "暂不回答"]
      ])}
    </div>
  `;
}

function renderMenstrualStep() {
  const d = state.draft;
  return `
    <div class="form-grid">
      <div class="field full">
        <button class="btn btn-secondary btn-medium" type="button" data-action="import-cycle">从 App 经期记录导入</button>
        <small>若已有记录，可自动带入最近周期；仍可手动修改。</small>
      </div>
      ${dateField("lastPeriodDate", "最近一次月经开始日期", d.lastPeriodDate)}
      ${numberField("cycleLength", "平均周期长度", d.cycleLength, "天", 15, 120)}
      ${numberField("periodDays", "平均经期天数", d.periodDays, "天", 1, 20)}
      ${numberField("amenorrheaMonths", "连续未自然来月经", d.amenorrheaMonths, "个月", 0, 120)}
      ${selectField("cycleRegularity", "近 12 个月周期变化", d.cycleRegularity, [
        ["regular", "基本规律"],
        ["variable", "变化超过 7 天"],
        ["skipped", "曾间隔 60 天以上"],
        ["none", "已无自然月经"],
        ["unknown", "不确定"]
      ])}
      ${selectField("abnormalBleeding", "是否出现异常出血", d.abnormalBleeding, [
        ["no", "否"],
        ["heavy", "经量明显增多或大量出血"],
        ["between", "非经期出血"],
        ["postmenopause", "停经 12 个月后出血"],
        ["skip", "暂不回答"]
      ])}
    </div>
  `;
}

function renderSymptomsStep() {
  const d = state.draft;
  return `
    <div class="scale-list">
      <p class="muted">按最近 2-4 周感受选择：0 无，1 轻微，2 中等，3 明显，4 很严重。</p>
      ${symptomItems
        .map(([id, label]) => {
          const value = d[id] ?? 0;
          return `
            <div class="scale-item">
              <strong>${label}</strong>
              <div class="scale-row">
                ${[0, 1, 2, 3, 4]
                  .map(
                    (score) => `
                    <label class="radio">
                      <input type="radio" name="${id}" value="${score}" ${Number(value) === score ? "checked" : ""} />
                      <span></span>
                      ${score}
                    </label>
                  `
                  )
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderHealthStep() {
  const d = state.draft;
  return `
    <div class="form-grid">
      ${selectField("severeMood", "近期是否有严重情绪风险", d.severeMood, [
        ["no", "否"],
        ["yes", "有伤害自己或无法控制的念头"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("chestPain", "是否出现胸痛或明显呼吸困难", d.chestPain, [
        ["no", "否"],
        ["yes", "是"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("fractureRisk", "骨折或骨质疏松风险", d.fractureRisk, [
        ["low", "无明显风险"],
        ["family", "父母髋部骨折/本人低创骨折"],
        ["steroid", "长期使用糖皮质激素"],
        ["unknown", "不确定"]
      ])}
      ${selectField("cardioRisk", "心血管代谢情况", d.cardioRisk, [
        ["low", "无已知异常"],
        ["bp", "血压偏高"],
        ["glucose", "血糖或血脂异常"],
        ["multiple", "多项异常或正在治疗"],
        ["unknown", "不确定"]
      ])}
      ${selectField("urogenitalImpact", "泌尿生殖不适影响", d.urogenitalImpact, [
        ["none", "无明显影响"],
        ["mild", "偶尔影响"],
        ["moderate", "经常影响"],
        ["severe", "明显影响生活"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("sexImpact", "性生活相关困扰", d.sexImpact, [
        ["none", "无明显困扰"],
        ["mild", "轻微困扰"],
        ["moderate", "中等困扰"],
        ["severe", "明显困扰"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("exercise", "每周中等强度运动", d.exercise, [
        ["enough", "150 分钟及以上"],
        ["some", "60-149 分钟"],
        ["little", "少于 60 分钟"],
        ["unknown", "不确定"]
      ])}
      ${selectField("nutrition", "钙、蛋白质与均衡饮食", d.nutrition, [
        ["good", "基本充足"],
        ["average", "偶尔不足"],
        ["poor", "经常不足"],
        ["unknown", "不确定"]
      ])}
    </div>
  `;
}

function renderCareStep() {
  const d = state.draft;
  return `
    <div class="form-grid">
      ${selectField("recentMajorDisease", "近期重大疾病、手术或治疗", d.recentMajorDisease, [
        ["no", "否"],
        ["yes", "是"],
        ["skip", "暂不回答"]
      ])}
      ${selectField("carePreference", "如需咨询，倾向科室", d.carePreference, [
        ["gynecology", "妇科"],
        ["endocrineGyne", "妇科内分泌/更年期门诊"],
        ["mental", "心理/精神专科"],
        ["emergency", "急诊"],
        ["unknown", "不确定"]
      ])}
      <div class="form-row field full">
        <div class="form-row-title"><span>想记录给医生看的情况</span></div>
        <textarea id="notes" name="notes" placeholder="例如：出血情况、潮热频率、睡眠变化、正在服用的药物">${escapeHtml(d.notes || "")}</textarea>
      </div>
    </div>
  `;
}

function numberField(name, label, value, suffix, min, max) {
  return `
    <div class="form-row">
      <div class="form-row-title"><span>${label}</span><b>${suffix}</b></div>
      <input id="${name}" name="${name}" type="number" min="${min}" max="${max}" value="${value ?? ""}" inputmode="decimal" />
    </div>
  `;
}

function dateField(name, label, value) {
  return `
    <div class="form-row">
      <div class="form-row-title"><span>${label}</span></div>
      <input id="${name}" name="${name}" type="date" value="${value ?? ""}" />
    </div>
  `;
}

function selectField(name, label, value, options) {
  return `
    <div class="form-row select-row">
      <div>
        <div class="form-row-title"><span>${label}</span></div>
        <select id="${name}" name="${name}">
          <option value="">请选择</option>
          ${options.map(([optionValue, text]) => `<option value="${optionValue}" ${value === optionValue ? "selected" : ""}>${text}</option>`).join("")}
        </select>
      </div>
      <span class="chevron">›</span>
    </div>
  `;
}

function bindFormInputs() {
  $("#assessmentForm").querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("change", updateDraftFromInput);
    input.addEventListener("input", updateDraftFromInput);
  });
  bindDynamicActions($("#assessmentForm"));
}

function updateDraftFromInput(event) {
  const input = event.target;
  if (input.name === "consent") {
    state.consent = input.checked;
  } else if (input.name?.startsWith("deep_")) {
    if (input.checked) {
      state.deepAnswers[input.name.replace("deep_", "")] = input.value;
      renderDeepAssessment();
    }
  } else if (input.type === "radio") {
    if (input.checked) state.draft[input.name] = input.value;
  } else {
    state.draft[input.name] = input.value;
  }
  if (["height", "weight"].includes(input.name)) {
    updateBiometricsFromDraft();
    updateDeepBmiPreview();
  }
  saveState();
}

function updateBiometricsFromDraft() {
  state.biometrics = {
    ...(state.biometrics || {}),
    height: state.draft.height || state.biometrics?.height,
    weight: state.draft.weight || state.biometrics?.weight,
    updatedAt: new Date().toISOString()
  };
}

function updateDeepBmiPreview() {
  const value = $("#deepBmiValue");
  const level = $("#deepBmiLevel");
  if (!value || !level) return;
  const bmi = getBmi(state.draft);
  value.textContent = bmi ? bmi.toFixed(1) : "--";
  level.textContent = bmi ? getBmiLevel(bmi) : "填写后自动计算";
}

function validateStep() {
  if (wizardStep === 0 && !state.consent) {
    showToast("请先确认授权后继续。");
    return false;
  }
  if (wizardStep === 1 && !state.draft.age) {
    showToast("请填写年龄，才能生成阶段判断。");
    return false;
  }
  if (wizardStep === 2 && !state.draft.lastPeriodDate && !state.draft.amenorrheaMonths) {
    showToast("请填写最近月经或停经时长。");
    return false;
  }
  if (wizardStep === 2 && !state.draft.lastPeriodDate && Number(state.draft.amenorrheaMonths) === 0) {
    showToast("停经 0 个月时，请补充最近一次月经日期。");
    return false;
  }
  return true;
}

function completeWizard() {
  if (!validateStep()) return;
  const report = buildReport();
  state.reports.unshift(report);
  state.lastReportId = report.id;
  state.draft = {};
  saveState();
  navigate("report");
  showToast("报告已生成。");
}

function buildReport() {
  const d = state.draft;
  const symptomScores = scoreSymptoms(d);
  const redFlags = detectRedFlags(d);
  const riskTags = buildRiskTags(d, symptomScores);
  const stage = classifyStage(d);
  const healthIndex = calculateHealthIndex(d, symptomScores, redFlags, riskTags);
  const completedAt = new Date().toISOString();
  const retestAt = addDays(completedAt, redFlags.length ? 14 : 90).toISOString();
  const primaryConcern = redFlags[0] || riskTags[0] || "建议继续保持记录与定期复测";
  const report = {
    id: `r_${Date.now()}`,
    type: "full",
    completedAt,
    retestAt,
    stage,
    symptomScores,
    redFlags,
    riskTags,
    healthIndex,
    healthLevel: getHealthLevel(healthIndex),
    primaryConcern,
    dataSource: d.importedCycle ? "App 经期记录 + 评测补录" : "评测补录",
    healthProfile: buildHealthProfile(d, completedAt),
    menstrualProfile: {
      lastPeriodDate: d.lastPeriodDate,
      cycleLength: d.cycleLength,
      periodDays: d.periodDays,
      amenorrheaMonths: d.amenorrheaMonths,
      cycleRegularity: d.cycleRegularity,
      abnormalBleeding: d.abnormalBleeding
    },
    notes: d.notes || ""
  };
  state.biometrics = {
    height: report.healthProfile.height,
    weight: report.healthProfile.weight,
    updatedAt: completedAt
  };
  syncPeriodHistory(report);
  return report;
}

function buildHealthProfile(d, updatedAt) {
  const bmi = getBmi(d);
  return {
    age: d.age,
    height: d.height,
    weight: d.weight,
    bmi: bmi ? Number(bmi.toFixed(1)) : null,
    bmiLevel: bmi ? getBmiLevel(bmi) : "信息不足",
    updatedAt
  };
}

function completeDeepAssessment(config) {
  const result = getDeepResult(config);
  const report = buildDeepReport(config, result);
  state.reports.unshift(report);
  state.lastReportId = report.id;
  saveState();
  deepStep = config.steps.length;
  renderDeepResult(result);
  showToast("深度报告已保存至我的测评。");
}

function buildDeepReport(config, result) {
  const completedAt = new Date().toISOString();
  return {
    id: `dr_${Date.now()}`,
    type: "deep",
    assessmentId: activeDeepAssessmentId,
    title: config.title,
    category: config.resultKicker || "深度健康评测",
    completedAt,
    retestAt: addDays(completedAt, result.className === "is-high" ? 30 : 90).toISOString(),
    dataSource: "深度评测问卷",
    resultBadge: getDeepResultBadge(result),
    resultClass: result.className,
    level: result.level,
    summary: result.summary,
    cta: result.cta,
    tip: result.tip,
    yesCount: result.yesCount,
    countLabel: result.countLabel,
    recommendations: result.recommendations,
    keyPrompts: result.keyPrompts,
    answers: getDeepAnswerSnapshot(config)
  };
}

function getDeepAnswerSnapshot(config) {
  return config.steps.flatMap((step) =>
    step.questions.map(([id, question]) => ({
      id,
      question,
      answer: state.deepAnswers?.[id] || ""
    }))
  );
}

function scoreSymptoms(d) {
  const scores = { somatic: 0, psychological: 0, urogenital: 0, total: 0 };
  symptomItems.forEach(([id, , domain]) => {
    const score = Number(d[id] ?? 0);
    scores[domain] += score;
    scores.total += score;
  });
  return scores;
}

function detectRedFlags(d) {
  const flags = [];
  if (["heavy", "between", "postmenopause"].includes(d.abnormalBleeding)) {
    flags.push("出现异常出血，建议尽快咨询妇科或妇科内分泌医生");
  }
  if (Number(d.amenorrheaMonths) >= 12 && d.abnormalBleeding === "postmenopause") {
    flags.push("停经 12 个月后出血，建议尽快就医评估");
  }
  if (d.severeMood === "yes") {
    flags.push("存在严重情绪风险，请尽快寻求专业帮助");
  }
  if (d.chestPain === "yes") {
    flags.push("胸痛或明显呼吸困难需优先排除急症风险");
  }
  if (d.pregnancy === "pregnant") {
    flags.push("可能妊娠时不建议按围绝经期自行判断，请先确认妊娠情况");
  }
  if (d.recentMajorDisease === "yes") {
    flags.push("近期重大疾病或治疗可能影响判断，建议带记录就医咨询");
  }
  return Array.from(new Set(flags));
}

function buildRiskTags(d, symptomScores) {
  const tags = [];
  if (symptomScores.total >= 18) tags.push("症状负担较高，建议优先关注潮热、睡眠、情绪与泌尿生殖困扰");
  if (symptomScores.psychological >= 8) tags.push("睡眠情绪维度较突出，建议连续记录 2 周变化");
  if (symptomScores.urogenital >= 6 || ["moderate", "severe"].includes(d.urogenitalImpact)) tags.push("泌尿生殖不适影响较明显，可准备症状记录后咨询医生");
  if (["family", "steroid"].includes(d.fractureRisk)) tags.push("骨健康风险需关注，建议记录运动、钙蛋白摄入与既往骨折史");
  if (["bp", "glucose", "multiple"].includes(d.cardioRisk)) tags.push("心血管代谢风险需关注，建议带近期血压、血糖、血脂结果咨询");
  if (["little"].includes(d.exercise)) tags.push("运动量不足，建议从可持续的中等强度活动开始");
  if (["poor"].includes(d.nutrition)) tags.push("营养摄入可能不足，建议关注蛋白质、钙和维生素 D 来源");
  if (["moderate", "severe"].includes(d.sexImpact)) tags.push("性生活相关困扰可作为私密健康问题记录并咨询");
  return tags;
}

function classifyStage(d) {
  const age = Number(d.age);
  const amenorrhea = Number(d.amenorrheaMonths);
  if (!age || (!d.lastPeriodDate && Number.isNaN(amenorrhea))) {
    return { label: "信息不足", detail: "缺少年龄或月经时间信息，建议补充后再判断。" };
  }
  if (d.pregnancy === "pregnant" || d.pregnancy === "lactation") {
    return { label: "暂不判断", detail: "妊娠或哺乳期会影响月经状态，建议先结合医生意见。" };
  }
  if (d.surgery === "ovary") {
    return { label: "需结合手术史评估", detail: "卵巢相关手术会影响自然分期，建议带手术史咨询医生。" };
  }
  if (amenorrhea >= 12 && age >= 45) {
    return { label: "可能已进入绝经后", detail: "连续 12 个月以上未自然来月经时，可作为健康管理参考。" };
  }
  if (d.cycleRegularity === "skipped" || amenorrhea >= 2) {
    return { label: "可能处于绝经过渡晚期", detail: "出现较长间隔或停经数月，建议持续记录周期变化。" };
  }
  if (d.cycleRegularity === "variable" || Number(d.cycleLength) >= 35) {
    return { label: "可能处于绝经过渡早期", detail: "周期长度波动增大，适合开始围绝经期健康管理。" };
  }
  if (age >= 40) {
    return { label: "可能处于生育晚期", detail: "目前周期相对规律，仍建议关注症状和慢病预防。" };
  }
  return { label: "暂未进入典型年龄段", detail: "如有明显症状或异常出血，建议记录并咨询医生。" };
}

function calculateHealthIndex(d, symptomScores, redFlags, riskTags) {
  const bmi = getBmi(d);
  let score = 100;
  score -= Math.min(symptomScores.total * 1.35, 35);
  score -= redFlags.length * 12;
  score -= Math.min(riskTags.length * 4, 18);
  if (bmi && (bmi < 18.5 || bmi >= 28)) score -= 6;
  return Math.max(35, Math.min(98, Math.round(score)));
}

function getHealthLevel(score) {
  if (score >= 85) return "状态较稳";
  if (score >= 70) return "建议关注";
  if (score >= 55) return "需重点管理";
  return "建议尽快咨询";
}

function getBmi(d) {
  const h = Number(d.height) / 100;
  const w = Number(d.weight);
  if (!h || !w) return null;
  return w / (h * h);
}

function getBmiLevel(bmi) {
  if (bmi < 18.5) return "BMI 偏低";
  if (bmi < 24) return "BMI 在参考范围内";
  if (bmi < 28) return "BMI 偏高";
  return "BMI 较高";
}

function renderReport() {
  const report = getLatestReport();
  const container = $("#reportContent");
  if (!report) {
    $("#reportTitle").textContent = "本次评测报告";
    container.innerHTML = `<article class="notice-panel"><h2>暂无报告</h2><p>完成一次评测后会生成报告。</p></article>`;
    return;
  }
  if (getReportType(report) === "deep") {
    renderDeepReportDetail(report, container);
    return;
  }
  $("#reportTitle").textContent = "本次评测报告";
  container.innerHTML = `
    <div class="report-grid">
      <div class="report-stack">
        <article class="report-panel">
          <div class="report-heading">
            <div>
              <p class="eyebrow">${formatDateTime(report.completedAt)} · ${report.dataSource}</p>
              <h2>${report.stage.label}</h2>
            </div>
            <span class="big-score">${report.healthIndex}</span>
          </div>
          <p>${report.stage.detail}</p>
          <div class="meter"><span style="width:${report.healthIndex}%"></span></div>
          <p class="muted">综合状态：${report.healthLevel}</p>
        </article>
        ${report.redFlags.length ? renderWarnings(report.redFlags) : renderNoUrgentWarning()}
      </div>
      <div class="report-stack">
        <article class="report-panel">
          <h2>维度结果</h2>
          ${domainRow("躯体症状", report.symptomScores.somatic, 12)}
          ${domainRow("心理睡眠", report.symptomScores.psychological, 20)}
          ${domainRow("泌尿生殖", report.symptomScores.urogenital, 12)}
          ${domainRow("症状总分", report.symptomScores.total, 44)}
        </article>
        <article class="report-panel">
          <h2>健康管理建议</h2>
          <ul class="report-list">
            ${buildRecommendations(report).map((item) => `<li><span>·</span><span>${item}</span></li>`).join("")}
          </ul>
        </article>
        <article class="report-panel">
          <h2>就医准备</h2>
          <ul class="report-list">
            <li><span>·</span><span>记录最近 3-6 个月月经日期、经量变化、出血异常和主要症状。</span></li>
            <li><span>·</span><span>带上既往疾病、手术史、用药史和近期检查结果。</span></li>
            <li><span>·</span><span>如有胸痛、严重情绪风险或大量出血，请优先处理急症风险。</span></li>
          </ul>
        </article>
      </div>
    </div>
  `;
}

function renderDeepReportDetail(report, container) {
  $("#reportTitle").textContent = "深度评测报告";
  const config = getDeepAssessmentConfig(report.assessmentId);
  container.innerHTML = getTemplateDeepResultHtml(
    config,
    buildDeepResultFromReport(report),
    report.completedAt || "2026-07-27",
    report.assessmentId
  );
}

function buildDeepResultFromReport(report) {
  return {
    yesCount: report.yesCount || 0,
    kicker: report.category || "健康风险提示",
    keyPrompts: report.keyPrompts || [],
    countLabel: report.countLabel || "项风险信号",
    className: report.resultClass || "is-low",
    level: report.level || "暂未发现明显风险",
    summary: report.summary || "",
    cta: report.cta || "查看建议",
    tip: report.tip || "",
    recommendations: report.recommendations || []
  };
}

function getReminderText(item) {
  return typeof item === "string" ? item : item?.text || "";
}

function getDeepReportMeterWidth(report) {
  const total = Math.max(report.answers?.length || 1, report.yesCount || 1);
  return Math.min(100, Math.round((report.yesCount / total) * 100));
}

function renderWarnings(flags) {
  return `
    <article class="report-panel warning-panel">
      <h2>需要优先关注</h2>
      <ul class="report-list">
        ${flags.map((flag) => `<li><span>·</span><span>${flag}</span></li>`).join("")}
      </ul>
    </article>
  `;
}

function renderNoUrgentWarning() {
  return `
    <article class="report-panel">
      <h2>风险提示</h2>
      <p>本次未触发紧急风险提示。若后续出现异常出血、胸痛、严重情绪风险等情况，请及时就医。</p>
    </article>
  `;
}

function domainRow(label, value, max) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return `
    <div class="domain-row">
      <span>${label}</span>
      <div class="domain-bar"><span style="width:${percent}%"></span></div>
      <strong>${value}/${max}</strong>
    </div>
  `;
}

function buildRecommendations(report) {
  const base = [
    "继续记录经期、潮热盗汗、睡眠、情绪和泌尿生殖变化。",
    "保持可持续运动、均衡饮食和规律睡眠，优先选择容易坚持的行动。"
  ];
  if (report.riskTags.length) return [...report.riskTags.slice(0, 5), ...base];
  return ["当前无突出风险标签，建议按计划复测并保持记录。", ...base];
}

function syncPeriodHistory(report) {
  const p = report.menstrualProfile;
  if (!p.lastPeriodDate || !p.cycleLength) return;
  const exists = state.periodHistory.some((item) => item.date === p.lastPeriodDate);
  if (!exists) {
    state.periodHistory.push({
      date: p.lastPeriodDate,
      cycleLength: Number(p.cycleLength),
      periodDays: Number(p.periodDays) || 0
    });
  }
}

function importCycleData() {
  const latest = state.periodHistory[state.periodHistory.length - 1];
  if (!latest) return;
  state.draft.lastPeriodDate = latest.date;
  state.draft.cycleLength = latest.cycleLength;
  state.draft.periodDays = latest.periodDays;
  state.draft.cycleRegularity = "variable";
  state.draft.importedCycle = true;
  saveState();
  renderWizard();
  showToast("已导入最近经期记录。");
}

function addDays(dateLike, days) {
  const date = new Date(dateLike);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(dateLike) {
  if (!dateLike) return "--";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return dateLike;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(dateLike) {
  if (!dateLike) return "--";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return dateLike;
  return `${formatDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char];
  });
}

function bindDynamicActions(root = document) {
  root.querySelectorAll("[data-action]").forEach((element) => {
    element.onclick = () => {
      const action = element.dataset.action;
      if (action === "start-full") startWizard();
      if (action === "start-deep") startDeepAssessment(element.dataset.id || "osteoporosis");
      if (action === "set-assessment-tab") {
        activeAssessmentGroup = element.dataset.group || "all";
        $all('[data-action="set-assessment-tab"]').forEach((tab) => {
          const isActive = tab.dataset.group === activeAssessmentGroup;
          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
        });
        renderAssessmentCards($("#assessmentPreview"), getFilteredAssessments(getSortedAssessments()));
        renderAssessmentCards($("#assessmentLibrary"), getFilteredAssessments(getSortedAssessments()));
      }
      if (action === "import-cycle") importCycleData();
      if (action === "open-report") {
        state.lastReportId = element.dataset.id;
        reportReturnRoute = route === "history" ? "history" : "dashboard";
        saveState();
        navigate("report");
      }
      if (action === "delete-report") {
        state.reports = state.reports.filter((report) => report.id !== element.dataset.id);
        state.lastReportId = state.reports[0]?.id || null;
        saveState();
        render();
        showToast("已删除该报告。");
      }
    };
    if (element.getAttribute("role") === "button") {
      element.onkeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        element.click();
      };
    }
  });
}

document.addEventListener("click", (event) => {
  const placeholderTab = event.target.closest("[data-tab-placeholder]");
  if (placeholderTab) {
    showToast(`${placeholderTab.textContent.trim()}为 App 主导航入口`);
    return;
  }
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) navigate(routeButton.dataset.route);
});

$("#prevStep").addEventListener("click", () => {
  if (activeDeepAssessmentId) {
    const config = getDeepAssessmentConfig(activeDeepAssessmentId);
    if (deepStep >= config.steps.length) {
      clearDeepAnswers(config);
      deepStep = 0;
      renderDeepAssessment();
      return;
    }
    if (deepStep > 0) {
      deepStep -= 1;
      renderDeepAssessment();
    } else {
      activeDeepAssessmentId = null;
      navigate("dashboard");
    }
    return;
  }
  if (wizardStep > 0) {
    wizardStep -= 1;
    renderWizard();
  }
});

function clearDeepAnswers(config) {
  config.steps.flatMap((step) => step.questions.map(([id]) => id)).forEach((id) => {
    delete state.deepAnswers[id];
  });
  saveState();
}

$("#nextStep").addEventListener("click", () => {
  if (activeDeepAssessmentId) {
    const config = getDeepAssessmentConfig(activeDeepAssessmentId);
    if (deepStep >= config.steps.length) {
      activeDeepAssessmentId = null;
      navigate("assessments");
      return;
    }
    if (deepStep < config.steps.length - 1) {
      deepStep += 1;
      renderDeepAssessment();
    } else {
      completeDeepAssessment(config);
    }
    return;
  }
  if (!validateStep()) return;
  if (wizardStep < steps.length - 1) {
    wizardStep += 1;
    renderWizard();
  } else {
    completeWizard();
  }
});

$("#saveConsent").addEventListener("click", () => {
  state.consent = $("#consentInput").checked;
  saveState();
  showToast(state.consent ? "授权已保存。" : "已取消授权。");
  render();
});

bindDynamicActions(document);
render();
