export const TURBULENCE_LEVELS = [
  { id: 'none', label: '无显著颠簸', text: '预计全程飞行平稳，无显著颠簸。' },
  { id: 'light', label: '轻度颠簸', text: '预计航路上部分航段有轻度颠簸。' },
  { id: 'moderate', label: '中度颠簸', text: '预计途中部分航段有中度颠簸，请乘务组注意安全。' },
  { id: 'heavy', label: '重要天气/强颠簸', text: '预计航路上有强雷雨天气，可能伴随强颠簸，请加强客舱协同。' },
];

export const PHASES = [
  { id: 'briefing', label: '乘务协同', delay: '起飞前 40-90m', icon: 'Users', category: 'cabin' },
  { id: 'coordination', label: '飞行员协同', delay: '航前准备阶段', icon: 'ShieldCheck', category: 'cockpit' },
  { id: 'boarding', label: '登机通知', delay: '旅客登机前', icon: 'Plane', category: 'cabin' },
  { id: 'technical', label: '机场/风险提示', delay: '运行风险简令', icon: 'AlertTriangle', category: 'cockpit' },
  { id: 'full', label: '综合通报', delay: '一键生成全文', icon: 'Check', category: 'all' },
];

export const TECHNICAL_PRESETS: Record<string, string> = {
  KMG: `1. 机位坡度：120、121、S107、S108 坡度 >0.8%，谨慎单发滑行。
2. 重着陆风险：03/22 跑道入口内移，21 号内移 540m，防视觉偏差。
3. 自动落地：04 号跑道不在清单内，禁止执行自动落地。
4. 过渡高度：TA 5400m / TL 6000m (与国内常规不同)，防气压误设定。
5. 地形防撞：22 号进近雷达引导可能触发地形警告；3000m 切入五边注意东侧 2627m 地形。
6. 高度限制：机场标高 6901FT；形态高度限制 20000FT；17000ft(10000) 调速。
7. 稳定进近：高原机场需早调速、早建立形态，防高进近风险。
8. 性能计算：起飞性能务必核对新 CalTow，关注关组件/APU 起飞性能。
9. 侧风限制：人工落地侧风 29kt (含阵风 10kt)，注意低空乱流。`,
  PKX: `1. 滑行警戒：前方出现 2 个及以上绿色中线灯亮属不正常情况，立即停止并确认。
2. 单发滑行：108、124、130、132、147、150、162、163、169 停机位滑行不畅，不建议单发。
3. 性能监测：减速慢风险，注意近期道面效应。`,
};

export const TEMPLATES: Record<string, (data: any) => string> = {
  briefing: (data: any) => {
    const { captainName, flightNo, origin, destination, std, duration, altitude, turbulence, paxTotal, paxVip, extra } = data;
    const turbText = TURBULENCE_LEVELS.find(l => l.id === turbulence)?.text || '';
    
    return `【乘务协同 - 航前准备】
各位同事好，机长${captainName || '___'}。今日${flightNo || 'CZ____'}航班${origin || '___'}-${destination || '___'}。
预计起飞 ${std || '00:00'}，飞行 ${duration || '0'}h，高度 ${altitude || '0'}m。

【颠簸提醒】
${turbText}

【载客信息】
旅客 ${paxTotal || '0'} 人，VIP ${paxVip || '0'} 人。

【工作要求】
${extra || '请大家按程序做好航前准备，落实客舱安全规定。祝大家飞行愉快，起落安好！'}`;
  },
  coordination: (data: any) => {
    const { reportTime, busTime, extra } = data;
    return `【航前机组准备确认】
1. 已确认数据库有效。
2. 已检查箱包无违禁品。
3. 已完成网上准备。
4. 已检查飞行用具。
5. 着装：听安排。
6. 签到时间：${reportTime || '12:30'} / 发车时间：${busTime || '12:50'}。
7. 签到前10分钟，若对组员位置不明确，需立即电话确认。

【补充/提示】
${extra || '无'}
（注：1人发送即可，其余人员确认后发送“确认”）`;
  },
  technical: (data: any) => {
    const { airportRisk, customRisk } = data;
    const header = airportRisk ? `【${airportRisk} 运行风险通报】` : '【运行风险通报】';
    
    // Use manual/AI risk if available, otherwise show placeholder
    const riskContent = customRisk || (airportRisk && TECHNICAL_PRESETS[airportRisk]) || '请关注主要问题：减速慢、颠簸、高原标高地形、性能用CalTow。近期气温升高，注意道面效应及关组件起飞风险。';
    
    return `${header}
${riskContent}

（注：1人发送即可，通报全体机组）`;
  },
  boarding: (data: any) => {
    const { flightNo, std, paxTotal, extra } = data;
    return `【登机通知】
${flightNo || '航班'} 乘务组请注意：
飞机状态正常，驾驶舱准备完毕。预计 ${std || '00:00'} 开始登机。
今日旅客约 ${paxTotal || '0'} 位。
${extra ? `【备注】${extra}` : '请乘务组检查客舱，做好登机准备。'}`;
  },
  full: (data: any) => {
    const { captainName, flightNo, origin, destination, std, duration, paxTotal, turbulence, reportTime, busTime, airportRisk, customRisk, extra } = data;
    const turbText = TURBULENCE_LEVELS.find(l => l.id === turbulence)?.text || '';
    const riskContent = customRisk || (airportRisk && TECHNICAL_PRESETS[airportRisk]) || '按标准运行提示。';
    
    return `【${flightNo || 'CZ____'} 航前综合通报】

1. 飞行概要
机长：${captainName || '___'}
航段：${origin || '___'}-${destination || '___'}
STD：${std || '00:00'} / 飞行：${duration || '0'}h
载客：${paxTotal || '0'}人

2. 天气与颠簸
${turbText}

3. 出发节点
签到：${reportTime || '12:30'}
发车：${busTime || '12:50'}

4. 运行风险提示 (${airportRisk || '通用'})
${riskContent}

5. 其它说明
${extra || '起落安好，飞行愉快。'}`;
  }
};
