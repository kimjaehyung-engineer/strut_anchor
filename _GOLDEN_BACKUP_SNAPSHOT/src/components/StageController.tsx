import React, { useEffect, useState } from 'react';
import { ExcavationStage } from '../types';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StageControllerProps {
  stages: ExcavationStage[];
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
}

export const StageController: React.FC<StageControllerProps> = ({
  stages,
  currentStepIndex,
  onSelectStep,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000); // ms per step

  const currentStage = stages[currentStepIndex] || stages[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStepIndex < stages.length - 1) {
          onSelectStep(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, stages.length, onSelectStep, playbackSpeed]);

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onSelectStep(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < stages.length - 1) {
      onSelectStep(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onSelectStep(0);
  };

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm p-3.5 lg:p-4 flex flex-col gap-3">
      {/* Control Buttons & Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded border border-blue-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">단계별 굴착 및 지보 시공 시뮬레이션</div>
            <div className="text-sm lg:text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>{currentStage.name}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                Step {currentStage.step} / {stages.length - 1}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded border border-slate-200">
          <button
            onClick={handleReset}
            title="처음으로 리셋"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            title="이전 단계"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? '일시정지' : '자동 시뮬레이션 재생'}
            className={`px-3 py-1.5 rounded font-semibold text-xs flex items-center space-x-1.5 transition ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? '일시정지' : '공정 재생'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === stages.length - 1}
            title="다음 단계"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-slate-300 mx-1" />
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 2000 ? 1000 : 2000)}
            title="재생 속도"
            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-white rounded transition flex items-center space-x-1 font-mono"
          >
            <FastForward className="w-3 h-3" />
            <span>{playbackSpeed === 1000 ? '2x' : '1x'}</span>
          </button>
        </div>
      </div>

      {/* Stage Description Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 flex items-start space-x-2 text-xs text-slate-700">
        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-700 mr-1.5">[공정 설명]</span>
          <span>{currentStage.description}</span>
          <span className="ml-2 text-amber-700 font-medium">
            (현재 활성 버팀보: {currentStage.activeStrutIds.length}개단 설치 완료)
          </span>
        </div>
      </div>

      {/* Timeline Step Rail */}
      <div className="relative flex items-center justify-between pt-1 pb-0.5 overflow-x-auto gap-2">
        {stages.map((st, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          return (
            <button
              key={`stage-btn-${st.step}`}
              onClick={() => {
                setIsPlaying(false);
                onSelectStep(idx);
              }}
              className={`flex-1 min-w-[70px] text-center group cursor-pointer transition-all flex flex-col items-center`}
            >
              {/* Connector & Node */}
              <div className="flex items-center w-full relative mb-1.5">
                <div
                  className={`h-1 w-full rounded-full transition-all ${
                    isPassed ? 'bg-blue-600' : isCurrent ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-blue-600 border-white ring-2 ring-blue-500 scale-110 shadow-sm'
                      : isPassed
                      ? 'bg-blue-600 border-white'
                      : 'bg-white border-slate-300 group-hover:border-slate-400'
                  }`}
                >
                  {isPassed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
              </div>
              <span
                className={`text-[10px] font-semibold block truncate max-w-[80px] ${
                  isCurrent ? 'text-blue-600 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {st.name.replace(/\(GL.*?\)/, '').trim()}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                GL -{st.excavationDepth.toFixed(1)}m
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

