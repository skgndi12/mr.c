'use client';

import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

import { ChangeEventHandler } from 'react';

import Text from '@/components/common/server/text';
import { useSearchFormState } from '@/hooks/common/use-search-form-state';
import { useDropdown } from '@/hooks/common/use-dropdown';
import { FiltersProvider, useFilters } from '@/context/common/filters-context';
import { useSearchParams } from 'next/navigation';
import ChipButton from '@/components/common/client/chip-button';

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
