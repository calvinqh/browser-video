import { useState } from "react";
import styles from "../styles/FilterMenu.module.css";

const filterOptions = [
  { filterType: "noop", displayText: "No Filter" },
  { filterType: "gray", displayText: "Gray" },
  { filterType: "green", displayText: "Green" },
];

interface FilterMenuProps {
  videoProcessorModule: any;
  onFilterTypeSelect: (filterType: string) => {};
}

const FilterMenu = ({
  videoProcessorModule,
  onFilterTypeSelect,
}: FilterMenuProps) => {
  const [selectedFilterType, setSelectedFilterType] = useState("noop");

  const filterList = filterOptions.map((option) => {
    return (
      <li
        className={styles.menuItem}
        key={option.filterType}
        onClick={(e) => onFilterTypeSelect(option.filterType)}
      >
        {option.displayText}
      </li>
    );
  });

  return (
    <div className={styles.container}>
      <ul className={styles.menu} id="filter-list">{filterList}</ul>
    </div>
  );
};

export default FilterMenu;
