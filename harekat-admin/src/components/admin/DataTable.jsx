import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Skeleton,
  Alert,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import EmptyState from './EmptyState.jsx';

/**
 * Reusable MUI DataTable
 * @param {Array} columns - Array of { id, label, numeric, align, sortable, render(row), width }
 * @param {Array} rows - Array of objects
 * @param {boolean} loading - Loading flag
 * @param {string|null} error - Error message
 * @param {Function} onReload - Retry / refresh function
 * @param {string} searchPlaceholder - Placeholder for search bar
 * @param {Function} searchFilter - Custom (row, searchTerm) => boolean
 * @param {ReactNode} filterSlot - Extra filter controls (e.g. Select dropdowns)
 * @param {ReactNode} actionsSlot - Header right action buttons
 * @param {string} emptyTitle - Empty state title
 * @param {string} emptyDescription - Empty state description
 * @param {Function} onRowClick - Optional row click handler
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  error = null,
  onReload,
  searchPlaceholder = 'جستجو...',
  searchFilter,
  filterSlot,
  actionsSlot,
  emptyTitle = 'داده‌ای یافت نشد',
  emptyDescription = 'موردی برای نمایش با فیلترهای انتخابی وجود ندارد.',
  onRowClick,
  defaultSortBy,
  defaultSortOrder = 'asc',
  initialPageSize = 10,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [orderBy, setOrderBy] = useState(defaultSortBy || '');
  const [order, setOrder] = useState(defaultSortOrder);

  // Sorting handler
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.trim().toLowerCase();

    if (searchFilter) {
      return rows.filter((row) => searchFilter(row, term));
    }

    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col.id];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [rows, searchTerm, searchFilter, columns]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!orderBy) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredRows, orderBy, order]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {/* Table Toolbar */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" flex={1}>
          <TextField
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />

          {filterSlot}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" alignSelf={{ xs: 'flex-end', md: 'center' }}>
          {onReload && (
            <IconButton
              size="small"
              onClick={onReload}
              disabled={loading}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              title="بارگذاری مجدد"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
          {actionsSlot}
        </Stack>
      </Box>

      {/* Error state */}
      {error && (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              onReload && (
                <Button color="inherit" size="small" onClick={onReload}>
                  تلاش مجدد
                </Button>
              )
            }
          >
            خطا در بارگذاری داده‌ها: {error}
          </Alert>
        </Box>
      )}

      {/* Table Container */}
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || (col.numeric ? 'left' : 'right')}
                  sx={{ width: col.width, minWidth: col.minWidth }}
                  sortDirection={orderBy === col.id ? order : false}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: rowsPerPage > 5 ? 5 : rowsPerPage }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || (col.numeric ? 'left' : 'right')}>
                      <Skeleton variant="text" height={26} width={cIdx === 0 ? '70%' : '85%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || (col.numeric ? 'left' : 'right')}>
                      {col.render ? col.render(row) : row[col.id] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {!loading && !error && sortedRows.length === 0 && (
        <Box sx={{ p: 4 }}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </Box>
      )}

      {/* Pagination */}
      {!loading && sortedRows.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="تعداد در صفحه:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count !== -1 ? count : `بیش از ${to}`}`}
        />
      )}
    </Paper>
  );
}
