import React, { useState, useEffect, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 'react-resizable';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'react-resizable/css/styles.css'; // Ensure you have this CSS
import '../components/TableStyles.css';
import mockData from '../mockData';

const AdvancedTable = ({ initialData = mockData }) => {
    const [data, setData] = useState(initialData);
    const [columns, setColumns] = useState([
        { id: 'id', label: 'ID', width: 100 },
        { id: 'name', label: 'Name', width: 200 },
        { id: 'email', label: 'Email', width: 200 },
        { id: 'age', label: 'Age', width: 100 },
        { id: 'registrationDate', label: 'Registration Date', width: 200 },
    ]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({ name: '', email: '' });

    const onSort = (columnKey) => {
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });
    };

    const sortedData = useMemo(() => {
        if (sortConfig.key === null) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    useEffect(() => {
        const newData = mockData.filter(item =>
            item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            item.email.toLowerCase().includes(filters.email.toLowerCase())
        );
        setData(newData);
    }, [filters]);

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const reorderedColumns = Array.from(columns);
        const [removed] = reorderedColumns.splice(result.source.index, 1);
        reorderedColumns.splice(result.destination.index, 0, removed);
        setColumns(reorderedColumns);
    };

    const onResizeStop = (index, size) => {
        const newColumns = [...columns];
        newColumns[index].width = size.width;
        setColumns(newColumns);
    };

    return (
        <div className="table-container">
            <div>
                <input
                    className="input"
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={onFilterChange}
                    placeholder="Filter by name"
                />
                <input
                    className="input"
                    type="text"
                    name="email"
                    value={filters.email}
                    onChange={onFilterChange}
                    placeholder="Filter by email"
                />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-columns" direction="horizontal">
                    {(provided) => (
                        <table className="table" ref={provided.innerRef} {...provided.droppableProps}>
                            <thead>
                                <tr>
                                    {columns.map((column, index) => (
                                        <Draggable key={column.id} draggableId={`draggable-${column.id}`} index={index}>
                                            {(provided) => (
                                                <th
                                                    className="th resizable-box"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => onSort(column.id)}
                                                    style={{ width: column.width }}
                                                >
                                                    <Resizable
                                                        width={column.width}
                                                        height={30}
                                                        axis="x"
                                                        minConstraints={[50, 30]}
                                                        maxConstraints={[500, 30]}
                                                        onResizeStop={(e, { size }) => onResizeStop(index, size)}
                                                    >
                                                        <div className="resizable-content">
                                                            {column.label}
                                                        </div>
                                                    </Resizable>
                                                </th>
                                            )}
                                        </Draggable>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((row) => (
                                    <tr className="tr" key={row.id}>
                                        {columns.map((column) => (
                                            <td className="td" key={column.id}>{row[column.id]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            {provided.placeholder}
                        </table>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

AdvancedTable.propTypes = {
    initialData: PropTypes.array,
};

export default memo(AdvancedTable);
