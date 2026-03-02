import React from 'react';
import { team } from '@/config/team';

interface TeamProps {
  className?: string;
  columns?: 2 | 3 | 4;
}

const Team: React.FC<TeamProps> = ({ className, columns = 4 }) => {
  const columnClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  return (
    <section className={className}>
      <h2>Our team</h2>
      <p>We're a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.</p>
      <div className={`mt-6 mx-auto grid max-w-2xl grid-cols-1 gap-6 ${columnClasses[columns]} lg:mx-0 lg:max-w-none xl:col-span-2 justify-center`}>
        {team.map((person) => (
          <div key={person.name} className="text-center">
            <img
              className="aspect-square w-full rounded-2xl object-cover"
              src={person.imageUrl}
              alt=""
            />
            <div className="mt-4">
              <div className="text-base leading-tight text-gray-900">
                {person.link ? (
                  <a href={person.link} className="hover:text-primary transition-colors">{person.name}</a>
                ) : (
                  person.name
                )}, <span className="text-gray-600">{person.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;