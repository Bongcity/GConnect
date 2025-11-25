'use client';

import { Tab } from '@headlessui/react';
import ShopSettings from '@/components/settings/ShopSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import PasswordSettings from '@/components/settings/PasswordSettings';
import NaverApiSettings from '@/components/settings/NaverApiSettings';
import FeedSettings from '@/components/settings/FeedSettings';
import SchedulerSettings from '@/components/settings/SchedulerSettings';

const tabs = [
  { name: '상점 설정', component: ShopSettings },
  { name: '네이버 API', component: NaverApiSettings },
  { name: 'Google 피드', component: FeedSettings },
  { name: '자동 동기화', component: SchedulerSettings },
  { name: '프로필', component: ProfileSettings },
  { name: '비밀번호 변경', component: PasswordSettings },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">설정</h1>
        <p className="text-white/60">계정 및 상점 정보를 관리하세요</p>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-xl bg-white/5 p-2 mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy shadow'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className="rounded-xl glass-card p-8 focus:outline-none"
            >
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

