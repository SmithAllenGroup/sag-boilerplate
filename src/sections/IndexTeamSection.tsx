import React from 'react';
import { team } from '@/config/team';

interface IndexTeamSectionProps {
  className?: string;
}

const IndexTeamSection: React.FC<IndexTeamSectionProps> = ({ className, ...props }) => {

  return (
    <section className={className} {...props}>
      <div className="mx-auto max-w-7xl px-6">
        <h2>Our team</h2>
        <div className="mt-6 mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-4 lg:mx-0 lg:max-w-none xl:col-span-2">
          {team.map((person) => (
            <div key={person.name}>
              <img
                className="aspect-3/2 h-56 w-full rounded-2xl object-cover"
                src={person.imageUrl}
                alt=""
              />
              <div className="mt-4">
                <div className="text-lg leading-tight text-gray-900">{person.name}</div>
                <div className="text-sm text-gray-600">{person.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndexTeamSection;