import { HiArrowDown, HiArrowUp, HiOutlineTrash } from 'react-icons/hi2';

const button =
  'grid size-9 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30';

/** Move up / move down / remove buttons for one row of a repeatable list. */
const ListControls = ({ idPrefix, index, count, itemName, onMove, onRemove }) => (
  <div className="flex shrink-0 items-center gap-0.5">
    <button
      id={`${idPrefix}-${index}-up`}
      type="button"
      className={button}
      disabled={index === 0}
      onClick={() => onMove(index, -1)}
      aria-label={`Move ${itemName} ${index + 1} up`}
    >
      <HiArrowUp aria-hidden="true" />
    </button>
    <button
      id={`${idPrefix}-${index}-down`}
      type="button"
      className={button}
      disabled={index === count - 1}
      onClick={() => onMove(index, 1)}
      aria-label={`Move ${itemName} ${index + 1} down`}
    >
      <HiArrowDown aria-hidden="true" />
    </button>
    <button
      type="button"
      className={`${button} hover:text-danger`}
      onClick={() => onRemove(index)}
      aria-label={`Remove ${itemName} ${index + 1}`}
    >
      <HiOutlineTrash aria-hidden="true" />
    </button>
  </div>
);

export default ListControls;
