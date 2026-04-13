import React from 'react';
import { motion } from 'framer-motion';
import type { CropStage } from '../../../types';

interface PlotProgressBarProps {
  stage: CropStage;
}

const STAGES: CropStage[] = ['SOWED', 'GROWING', 'HARVEST_READY', 'HARVESTED'];

export const PlotProgressBar: React.FC<PlotProgressBarProps> = ({ stage }) => {
  const currentIndex = STAGES.indexOf(stage);
  const progress = ((currentIndex) / (STAGES.length - 1)) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center px-1">
        {STAGES.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <span className={`text-[8px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${
              i <= currentIndex ? 'text-emerald-600' : 'text-slate-300'
            }`}>
              {s.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
      
      <div className="relative h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
        {/* Background track marks */}
        <div className="absolute inset-0 flex justify-between px-[2px]">
          {STAGES.map((_, i) => (
            <div key={i} className={`w-[2px] h-full ${i <= currentIndex ? 'bg-emerald-200' : 'bg-slate-200'}`} />
          ))}
        </div>
        
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        />
      </div>
    </div>
  );
};
