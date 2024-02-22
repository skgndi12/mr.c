'use client';

import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

import { ChangeEventHandler, ReactNode } from 'react';
import clsx from 'clsx';

import Text from '@/components/atomic/text';
import { useSearchFormState } from '@/hooks/use-search-form-state';
import { useDropdown } from '@/hooks/use-dropdown';
import { FiltersProvider, useFilters } from '@/context/filters-context';
import { useSearchParams } from 'next/navigation';

// TODO: make it generic and seperate
function ChipButton({
  onClick,
  Text,
  Icon,
  rounded,
  type = 'button',
  width,
}: {
  Text: ReactNode;
  Icon?: ReactNode;
  onClick?: () => void;
  rounded: 'full' | 'lg';
  type?: 'button' | 'submit';
  width: 'fit' | 'full';
}) {
  const roundClass = clsx({ 'rounded-lg': rounded === 'lg', 'rounded-full': rounded === 'full' });
  const widthClass = clsx({ 'w-full': width === 'full', 'w-fit': width === 'fit' });

  return (
    <button
      className={clsx(
        'flex items-center space-x-1 px-2 py-1 hover:bg-gray-100',
        roundClass,
        widthClass
      )}
      onClick={onClick}
      type={type}
    >
      {Icon}
      {Text}
    </button>
  );
}

function FilterInput({ filter }: { filter: string }) {
  const {
    changeFilter,
    unselectFilter,
    selectedFilters,
    unselectedFilters,
    getFilterValue,
    setFilterValue,
  } = useFilters();

  const { targetRef, isDropdownOpen, toggleDropdown } = useDropdown<HTMLDivElement>();

  const text = getFilterValue(filter);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setFilterValue(filter, e.target.value);

  return (
    <div className="flex">
      <div ref={targetRef} className="relative">
        <ChipButton
          onClick={toggleDropdown}
          Text={<Text color="gray">{`${filter}:`}</Text>}
          rounded="lg"
          width="full"
        />

        {isDropdownOpen && (
          <div className="absolute left-0 top-7 z-10 flex-col items-center space-y-1 rounded-lg border bg-white p-2">
            {selectedFilters.length > 1 && (
              <ChipButton
                Icon={<MinusIcon className="w-4" />}
                Text={<Text>{filter}</Text>}
                onClick={() => unselectFilter(filter)}
                rounded="lg"
                width="full"
              />
            )}

            {unselectedFilters.map((target) => (
              <ChipButton
                key={target}
                Icon={<ArrowsRightLeftIcon className="w-4" />}
                onClick={() => changeFilter(filter, target)}
                Text={<Text>{target}</Text>}
                rounded="lg"
                width="full"
              />
            ))}
          </div>
        )}
      </div>

      <input
        className="w-full outline-none"
        name={filter}
        value={text}
        onChange={handleChange}
        placeholder={`Set ${filter}...`}
      />
    </div>
  );
}

function InnerSearchForm() {
  const { selectedFilters, selectFilter, unselectedFilters, filters } = useFilters();
  const { formAction } = useSearchFormState(filters);

  return (
    <form className="flex flex-col space-y-1" action={formAction}>
      <div className="flex items-center space-x-1">
        <ChipButton
          Icon={<MagnifyingGlassIcon className="w-4" />}
          Text={<Text>Search</Text>}
          type="submit"
          rounded="lg"
          width="fit"
        />

        {unselectedFilters.map((unselected) => {
          return (
            <ChipButton
              key={unselected}
              Icon={<PlusIcon className="w-4" />}
              Text={<Text>{unselected}</Text>}
              onClick={() => selectFilter(unselected)}
              rounded="lg"
              width="fit"
            />
          );
        })}
      </div>

      {selectedFilters.map((filter) => (
        <FilterInput key={filter} filter={filter} />
      ))}
    </form>
  );
}

export default function SearchForm({ filters }: { filters: string[] }) {
  const params = useSearchParams();

  return (
    <FiltersProvider
      filters={filters}
      key={filters.reduce((acc, filter) => acc + params.get(filter)?.toString(), '')}
    >
      <InnerSearchForm />
    </FiltersProvider>
  );
}
