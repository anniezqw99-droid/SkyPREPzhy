/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Users, 
  CloudLightning, 
  MessageSquare, 
  Copy, 
  Check, 
  Settings2,
  Info,
  ShieldCheck,
  AlertTriangle,
  Search,
  Loader2,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { TURBULENCE_LEVELS, TEMPLATES, PHASES } from './constants';
import { fetchAirportRisk } from './services/geminiService';

interface FlightData {
  captainName: string;
  flightNo: string;
  origin: string;
  destination: string;
  std: string;
  duration: string;
  altitude: string;
  turbulence: string;
  paxTotal: string;
  paxVip: string;
  extra: string;
  reportTime: string;
  busTime: string;
  airportRisk: string;
  customRisk: string;
}

const INITIAL_DATA: FlightData = {
  captainName: '',
  flightNo: 'CZ',
  origin: '',
  destination: '',
  std: '',
  duration: '',
  altitude: '9800',
  turbulence: 'none',
  paxTotal: '',
  paxVip: '0',
  extra: '',
  reportTime: '12:30',
  busTime: '12:50',
  airportRisk: '',
  customRisk: '',
};

export default function App() {
  const [data, setData] = useState<FlightData>(() => {
    const saved = localStorage.getItem('skyprep_defaults');
    return saved ? { ...INITIAL_DATA, ...JSON.parse(saved) } : INITIAL_DATA;
  });

  const [copied, setCopied] = useState(false);
  const [activePhase, setActivePhase] = useState(PHASES[0].id);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('skyprep_defaults', JSON.stringify({ captainName: data.captainName }));
  }, [data.captainName]);

  const message = useMemo(() => TEMPLATES[activePhase](data), [data, activePhase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiSearch = async () => {
    if (!data.airportRisk) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const risk = await fetchAirportRisk(data.airportRisk);
      setData(prev => ({ ...prev, customRisk: risk }));
    } catch (err: any) {
      setSearchError(err.message || "获取失败");
    } finally {
      setIsSearching(false);
    }
  };

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, className = "" }: any) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
        <Icon size={12} className="text-blue-500" />
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200">
      {/* Sidebar Navigation */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <Plane size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">SkyPrep</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">CSN Edition</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2">飞行阶段</p>
            {PHASES.map((phase) => {
              const Icon = phase.id === 'briefing' ? Users : 
                          phase.id === 'boarding' ? Plane : 
                          phase.id === 'coordination' ? ShieldCheck : 
                          phase.id === 'full' ? FileText : AlertTriangle;
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                    activePhase === phase.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={activePhase === phase.id ? 'text-white' : 'text-slate-400'} />
                    <span className="text-sm font-bold">{phase.label}</span>
                  </div>
                  <ChevronRight size={14} className={`opacity-0 group-hover:opacity-50 transition-opacity ${activePhase === phase.id ? 'hidden' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Online</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium capitalize">
                {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
            
            {/* Left: Editor Column */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black tracking-tight">{PHASES.find(p => p.id === activePhase)?.label}详情</h2>
                {activePhase === 'technical' && (
                   <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-bold flex items-center gap-2">
                     <AlertTriangle size={12} />
                     高原/复杂机场库
                   </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Section 1: Basic Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Settings2 size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">核心运行数据</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label="责任机长" icon={Users} value={data.captainName} onChange={(v: string) => setData({ ...data, captainName: v })} placeholder="姓名" />
                    <InputField label="航班号" icon={Plane} value={data.flightNo} onChange={(v: string) => setData({ ...data, flightNo: v })} placeholder="CZ301" />
                    <InputField label="起飞地" icon={MapPin} value={data.origin} onChange={(v: string) => setData({ ...data, origin: v })} placeholder="广州 CAN" />
                    <InputField label="目的地" icon={MapPin} value={data.destination} onChange={(v: string) => setData({ ...data, destination: v })} placeholder="目的地 ICAO/IATA" />
                    <InputField label="预计起飞 (STD)" icon={Clock} value={data.std} onChange={(v: string) => setData({ ...data, std: v })} placeholder="14:30" />
                    <InputField label="预计航程 (小时)" icon={Clock} value={data.duration} onChange={(v: string) => setData({ ...data, duration: v })} placeholder="2.5" />
                  </div>
                </div>

                {/* Section 2: Phase Specific Info */}
                {activePhase === 'coordination' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <ShieldCheck size={18} />
                      <h3 className="text-xs font-black uppercase tracking-widest">航前时间节点</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="签到时间" icon={Clock} value={data.reportTime} onChange={(v: string) => setData({ ...data, reportTime: v })} placeholder="12:30" />
                      <InputField label="发车时间" icon={Plane} value={data.busTime} onChange={(v: string) => setData({ ...data, busTime: v })} placeholder="12:50" />
                    </div>
                  </div>
                )}

                {activePhase === 'technical' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">机场运行风险寻踪</h3>
                      </div>
                      <div className="flex gap-2">
                        {['KMG', 'PKX', 'CAN', 'SZX'].map(city => (
                          <button
                            key={city}
                            onClick={() => setData({ ...data, airportRisk: city })}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all ${
                              data.airportRisk === city 
                              ? 'bg-amber-600 border-amber-600 text-white' 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          value={data.airportRisk}
                          onChange={(e) => setData({ ...data, airportRisk: e.target.value.toUpperCase() })}
                          placeholder="输入机场代码 (如: PVG)"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                        />
                      </div>
                      <button
                        onClick={handleAiSearch}
                        disabled={isSearching || !data.airportRisk}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
                      >
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        AI获取风险
                      </button>
                    </div>

                    {searchError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-2">
                        <Info size={14} />
                        {searchError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">风险提示详情 (可编辑)</label>
                      <textarea
                        value={data.customRisk}
                        onChange={(e) => setData({ ...data, customRisk: e.target.value })}
                        placeholder="点击AI获取或手动输入机场运行风险、滑行道限制、性能提示等..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-64 transition-all font-mono leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Section 3: Notes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <MessageSquare size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">备注与补充建议</h3>
                  </div>
                  <textarea
                    value={data.extra}
                    onChange={(e) => setData({ ...data, extra: e.target.value })}
                    placeholder="如：关注颠簸区、重要旅客、特殊配餐提醒等..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-32 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Preview Column */}
            <div className="xl:col-span-5 relative">
              <div className="sticky top-10 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black tracking-tight">内容预览</h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <ExternalLink size={14} />
                    Ready for Air姐
                  </div>
                </div>

                <div className="bg-[#1E293B] rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col min-h-[600px]">
                  <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">协同通报模板 (南航标准)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{activePhase}</span>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                      <Plane size={160} className="-rotate-12" />
                    </div>
                    
                    <pre className="text-blue-50 whitespace-pre-wrap font-mono text-[13px] leading-relaxed tracking-tight selection:bg-blue-500/50 relative z-10">
                      {message}
                    </pre>

                    <AnimatePresence>
                      {copied && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-blue-600/90 backdrop-blur-md z-20 px-8 text-center"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"
                            >
                              <Check size={40} className="text-white" />
                            </motion.div>
                            <div>
                              <span className="text-xl font-black text-white block">复制成功</span>
                              <span className="text-sm font-medium text-blue-100 mt-1">可以直接复制到钉钉/微信群了</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-6 bg-slate-800/30 border-t border-slate-700/50 space-y-4">
                    <button
                      onClick={handleCopy}
                      className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/30 text-base"
                    >
                      <Copy size={20} />
                      复制通报内容
                    </button>
                    
                    <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300">南航运行标准提示</p>
                        <p className="text-[11px] text-slate-500 leading-normal font-medium">
                          {PHASES.find(p => p.id === activePhase)?.delay}，通报建议涵盖高原、天气及运行风险等核心三要素。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
