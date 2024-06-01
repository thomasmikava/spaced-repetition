import { memo } from 'react';
import styles from './styles.module.css';

type NonExistingValue = null | undefined | false | '';

type CellValue = string | number | JSX.Element | NonExistingValue;

type CustomCell = { cellValue: CellValue; style?: React.CSSProperties };

type Cell = CellValue | CustomCell;

type CustomRow = { cells: Cell[]; style?: React.CSSProperties; key?: string | number };

export type TableRow = Cell[] | CustomRow;

const isEmpty = (value: unknown): value is NonExistingValue => {
  return value === null || value === undefined || value === false || value === '';
};

const isCustomRow = (row: TableRow): row is CustomRow => {
  return Array.isArray(row) === false && typeof row === 'object' && Array.isArray((row as CustomRow).cells);
};

const isCustomCell = (cell: Cell): cell is CustomCell => {
  return typeof cell === 'object' && cell !== null && 'cellValue' in cell;
};

interface Props {
  rows: TableRow[];
  removeEmptyColumns?: boolean;
  fullWidth?: boolean;
}

const realUndefined = '#@!$#';

export const Table = memo<Props>(({ rows, fullWidth, removeEmptyColumns = false }) => {
  const normalizedRows = removeEmptyColumns ? removeEmpty(rows) : rows;
  return (
    <table className={styles.lessonTable} style={{ width: fullWidth ? '100%' : undefined }}>
      <tbody>
        {normalizedRows.map((row, index) => {
          if (isEmpty(row)) return null;
          const defaultKey = `$indx-${index}`;
          const key = isCustomRow(row) ? row.key ?? defaultKey : defaultKey;
          const cells = isCustomRow(row) ? row.cells : row;
          const rowStyle = isCustomRow(row) ? row.style : undefined;
          return (
            <tr key={key} className={styles.row} style={rowStyle}>
              {cells.map((cell, cellIndex) => {
                if (cell === realUndefined) return null;
                const cellValue = isCustomCell(cell) ? cell.cellValue : cell;
                const cellStyle = isCustomCell(cell) ? cell.style : undefined;
                return (
                  <td key={cellIndex} style={cellStyle} className={styles.cell}>
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

function removeEmpty(rows: TableRow[]): TableRow[] {
  const columnsCount = rows.reduce((acc, row) => Math.max(acc, isCustomRow(row) ? row.cells.length : row.length), 0);
  const columnsFreeness = Array.from({ length: columnsCount }, () => true);
  for (const row of rows) {
    const cells = isCustomRow(row) ? row.cells : row;
    cells.forEach((cell, index) => {
      if (!columnsFreeness[index]) return;
      const val = isCustomCell(cell) ? cell.cellValue : cell;
      if (!isEmpty(val)) columnsFreeness[index] = false;
    });
  }
  return rows.map((row) => {
    if (isCustomRow(row)) {
      return { ...row, cells: row.cells.map((val, index) => (columnsFreeness[index] ? realUndefined : val)) };
    }
    return row.map((val, index) => (columnsFreeness[index] ? realUndefined : val));
  });
}
