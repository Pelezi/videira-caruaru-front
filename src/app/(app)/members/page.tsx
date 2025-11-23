"use client";

import React, { useEffect, useState } from 'react';
import { cellsService } from '@/services/cellsService';
import { membersService } from '@/services/membersService';
import { Cell, Member } from '@/types';
import toast from 'react-hot-toast';
import { createTheme, FormControl, InputLabel, MenuItem, Select, ThemeProvider } from '@mui/material';

export default function MembersManagementPage() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const c = await cellsService.getCells();
        setCells(c);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedCell === null) return;
    const load = async () => {
      try {
        const m = await membersService.getMembers(selectedCell);
        setMembers(m);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [selectedCell]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    updateDarkMode();
    window.addEventListener('storage', updateDarkMode);
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('storage', updateDarkMode);
      observer.disconnect();
    };
  }, []);

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (member: Member) => {
    if (selectedCell === null) return toast.error('Selecione uma célula');
    try {
      await membersService.updateMember(selectedCell, member.id, { name: editName });
      toast.success('Nome atualizado');
      const refreshed = await membersService.getMembers(selectedCell);
      setMembers(refreshed);
      cancelEdit();
    } catch (e) {
      console.error(e);
      toast.error('Falha ao atualizar');
    }
  };

  const removeMember = async (member: Member) => {
    if (!confirm(`Remover ${member.name}?`)) return;
    if (selectedCell === null) return toast.error('Selecione uma célula');
    try {
      await membersService.deleteMember(selectedCell, member.id);
      toast.success('Membro removido');
      const refreshed = await membersService.getMembers(selectedCell);
      setMembers(refreshed);
    } catch (e) {
      console.error(e);
      toast.error('Falha ao remover');
    }
  };

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#ffffffff' : '#000000ff',
      },
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gestão de Membros</h2>

      <div className="mb-4">
        <ThemeProvider theme={muiTheme}>
          <FormControl fullWidth required margin="normal">
            <InputLabel id="cell-type-label">Selecione uma célula</InputLabel>
            <Select
              labelId="cell-type-label"
              value={selectedCell ?? ''}
              label="Selecione uma célula"
              onChange={(e) => setSelectedCell(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value={0}>Selecione</MenuItem>
              {cells.map((cell: any) => (
                <MenuItem key={cell.id} value={cell.id}>
                  {cell.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ThemeProvider>
      </div>

      {selectedCell && (
        <div>
          <h3 className="font-medium mb-2">Membros</h3>
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 border p-2 rounded">
                {editingId === m.id ? (
                  <>
                    <input className="border p-1 rounded flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <button onClick={() => saveEdit(m)} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
                    <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{m.name}</span>
                    <button onClick={() => startEdit(m)} className="px-3 py-1 bg-yellow-400 text-white rounded">Editar</button>
                    <button onClick={() => removeMember(m)} className="px-3 py-1 bg-red-600 text-white rounded">Remover</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
