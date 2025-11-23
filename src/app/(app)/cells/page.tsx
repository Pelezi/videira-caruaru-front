"use client";

import React, { useEffect, useState, useRef } from 'react';
import { cellsService } from '@/services/cellsService';
import { membersService } from '@/services/membersService';
import { Cell } from '@/types';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CellsPage() {
  const [groups, setGroups] = useState<Cell[]>([]);
  const [name, setName] = useState('');
  // leader selection via autocomplete
  const [leaderName, setLeaderName] = useState('');
  const [leaderUserId, setLeaderUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [leaderQuery, setLeaderQuery] = useState('');
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLeaderUserId, setEditingLeaderUserId] = useState<number | null>(null);
  const [editingLeaderName, setEditingLeaderName] = useState('');
  const [editingLeaderQuery, setEditingLeaderQuery] = useState('');
  const [editingShowUsersDropdown, setEditingShowUsersDropdown] = useState(false);
  const { user } = useAuth();

  const leaderDropdownRef = useRef<any>(null);
  const editingLeaderDropdownRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showUsersDropdown) {
        if (leaderDropdownRef.current && !leaderDropdownRef.current.contains(target)) {
          setShowUsersDropdown(false);
        }
      }
      if (editingShowUsersDropdown) {
        if (editingLeaderDropdownRef.current && !editingLeaderDropdownRef.current.contains(target)) {
          setEditingShowUsersDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUsersDropdown, editingShowUsersDropdown]);

  const load = async () => {
    try {
      const g = await cellsService.getCells();
      const permission = user?.permission;

      if (permission && !permission.hasGlobalCellAccess) {
        const allowed = permission.cellIds || [];
        setGroups(g.filter((c) => allowed.includes(c.id)));
      } else {
        setGroups(g);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const run = async () => { await load(); };
    run();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const u = await userService.list();
        setUsers(u || []);
      } catch (err) {
        console.error('failed load users', err);
      }
    };
    loadUsers();
  }, []);

  // Re-load when user/permission changes
  useEffect(() => {
    load();
  }, [user?.permission]);

  const create = async () => {
    try {
      // include leaderUserId when provided
      await cellsService.createCell({ name, leaderUserId: leaderUserId || undefined });
      setName(''); setLeaderName(''); setLeaderUserId(null); setLeaderQuery('');
      toast.success('Célula criada');
      load();
    } catch (e) { console.error(e); toast.error('Falha'); }
  };

  const startEdit = (g: Cell) => {
    setEditingId(g.id);
    setEditingName(g.name);
    setEditingLeaderUserId(g.leader?.id ?? null);
    setEditingLeaderName(g.leader ? `${g.leader.firstName} ${g.leader.lastName}` : '');
    setEditingLeaderQuery('');
  };
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await cellsService.updateCell(editingId, { name: editingName, leaderUserId: editingLeaderUserId || undefined });
      setEditingId(null); setEditingName('');
      setEditingLeaderUserId(null); setEditingLeaderName(''); setEditingLeaderQuery(''); setEditingShowUsersDropdown(false);
      toast.success('Atualizado'); load();
    } catch (e) { console.error(e); toast.error('Falha'); }
  };

  const duplicate = async (g: Cell) => {
    try {
      await cellsService.createCell({ name: `${g.name} (cópia)`, leaderUserId: g.leader?.id });
      toast.success('Célula duplicada'); load();
    } catch (e) { console.error(e); toast.error('Falha'); }
  };

  // Multiply: open modal to pick members for the new cell and call backend
  const [multiplyingCell, setMultiplyingCell] = useState<Cell | null>(null);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [newCellNameField, setNewCellNameField] = useState('');
  const [newLeaderNameField, setNewLeaderNameField] = useState('');
  const [oldLeaderNameField, setOldLeaderNameField] = useState('');

  const openMultiply = async (g: Cell) => {
    setMultiplyingCell(g);
    setNewCellNameField(`${g.name} - Nova`);
    setOldLeaderNameField((g.leader && g.leader.name) || '');
    setNewLeaderNameField('');
    setSelectedMemberIds([]);
    try {
      const m = await membersService.getMembers(g.id);
      setAvailableMembers(m);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao carregar membros');
    }
  };

  const toggleMemberSelection = (id: number) => {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitMultiply = async () => {
    if (!multiplyingCell) return;
    try {
      await cellsService.multiplyCell(multiplyingCell.id, {
        memberIds: selectedMemberIds,
        newCellName: newCellNameField,
        newLeaderUserId: undefined,
        oldLeaderUserId: undefined,
      });
      toast.success('Célula multiplicada');
      setMultiplyingCell(null);
      load();
    } catch (e) { console.error(e); toast.error('Falha ao multiplicar'); }
  };

  // Acompanhamento agora é uma página separada em /cells/[id]/presence

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Células</h2>

      <div className="mb-6">
        <label className="block mb-2">Nova célula</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded flex-1 bg-white dark:bg-gray-800 dark:text-white" />
          <div ref={leaderDropdownRef} className="relative w-full sm:w-48">
            <input placeholder="Líder" value={leaderQuery || leaderName} onChange={(e) => { setLeaderQuery(e.target.value); setShowUsersDropdown(true); setLeaderName(''); setLeaderUserId(null); }} onFocus={() => setShowUsersDropdown(true)} className="border p-2 rounded w-full bg-white dark:bg-gray-800 dark:text-white" />
            {showUsersDropdown && (
              <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 border mt-1 rounded max-h-44 overflow-auto z-50">
                {users.filter(u => {
                  const q = (leaderQuery || '').toLowerCase();
                  if (!q) return true;
                  return (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
                }).map(u => (
                  <div key={u.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between" onMouseDown={() => { /* use onMouseDown to avoid blur before click */ setLeaderUserId(u.id); setLeaderName(`${u.firstName} ${u.lastName}`); setLeaderQuery(''); setShowUsersDropdown(false); }}>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                    <div className="text-xs text-green-600">Selecionar</div>
                  </div>
                ))}
                <div className="px-3 py-2 border-t text-center">
                  <button onMouseDown={(e) => { e.preventDefault(); setShowUsersDropdown(false); setShowCreateUserModal(true); }} className="text-sm text-blue-600">Criar novo usuário</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={create} className="px-3 py-2 bg-green-600 text-white rounded" disabled={!!user?.permission && !user.permission.canManageCells}>Criar</button>
        </div>
      </div>

      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded w-11/12 sm:w-96">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Criar usuário</h4>
            <div className="mb-2">
              <label className="block text-sm mb-1">Email</label>
              <input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input placeholder="Nome" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
              <input placeholder="Sobrenome" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateUserModal(false)} className="px-3 py-1">Cancelar</button>
              <button onClick={async () => {
                try {
                  const created = await userService.invite({ email: newUserEmail, firstName: newUserFirstName, lastName: newUserLastName });
                  setUsers((prev) => [created, ...prev]);
                  // if creating from the main create flow
                  setLeaderUserId(created.id);
                  setLeaderName(`${created.firstName} ${created.lastName}`);
                  // if creating while editing a cell, select there as well
                  if (editingId) {
                    setEditingLeaderUserId(created.id);
                    setEditingLeaderName(`${created.firstName} ${created.lastName}`);
                    setEditingLeaderQuery('');
                    setEditingShowUsersDropdown(false);
                  }
                  setShowCreateUserModal(false);
                  setNewUserEmail(''); setNewUserFirstName(''); setNewUserLastName('');
                  toast.success('Usuário criado e selecionado como líder');
                } catch (err) { console.error(err); toast.error('Falha ao criar usuário'); }
              }} className="px-3 py-1 bg-blue-600 text-white rounded">Criar e selecionar</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Células existentes</h3>
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border p-3 rounded bg-white dark:bg-gray-900">
              <div className="mb-3 sm:mb-0">
                <div className="font-medium text-gray-900 dark:text-white">{g.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">id: {g.id}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/cells/${g.id}/members`} className="px-3 py-1 bg-blue-500 text-white rounded">Membros</Link>
                {(!user?.permission || user.permission.canManageCells) && (
                  <>
                    <button onClick={() => startEdit(g)} className="px-3 py-1 bg-yellow-400 rounded">Editar</button>
                    <button onClick={() => openMultiply(g)} className="px-3 py-1 bg-indigo-600 text-white rounded">Multiplicar</button>
                  </>
                )}
                <Link href={`/cells/${g.id}/presence`} className="px-3 py-1 bg-teal-600 text-white rounded">Acompanhamento</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-11/12 sm:w-96">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Editar célula</h4>
            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="border p-2 rounded w-full mb-4 bg-white dark:bg-gray-700 dark:text-white" />

            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Líder</label>
              <div ref={editingLeaderDropdownRef} className="relative w-full">
                <input placeholder="Líder" value={editingLeaderQuery || editingLeaderName} onChange={(e) => { setEditingLeaderQuery(e.target.value); setEditingShowUsersDropdown(true); setEditingLeaderName(''); setEditingLeaderUserId(null); }} onFocus={() => setEditingShowUsersDropdown(true)} className="border p-2 rounded w-full bg-white dark:bg-gray-800 dark:text-white" />
                {editingShowUsersDropdown && (
                  <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 border mt-1 rounded max-h-44 overflow-auto z-50">
                    {users.filter(u => {
                      const q = (editingLeaderQuery || '').toLowerCase();
                      if (!q) return true;
                      return (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
                    }).map(u => (
                      <div key={u.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between" onMouseDown={() => { setEditingLeaderUserId(u.id); setEditingLeaderName(`${u.firstName} ${u.lastName}`); setEditingLeaderQuery(''); setEditingShowUsersDropdown(false); }}>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                        </div>
                        <div className="text-xs text-green-600">Selecionar</div>
                      </div>
                    ))}
                    <div className="px-3 py-2 border-t text-center">
                      <button onMouseDown={(e) => { e.preventDefault(); setEditingShowUsersDropdown(false); setShowCreateUserModal(true); }} className="text-sm text-blue-600">Criar novo usuário</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingId(null)} className="px-3 py-1">Cancelar</button>
              <button onClick={saveEdit} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {multiplyingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start sm:items-center justify-center pt-20 sm:pt-0">
          <div className="bg-white dark:bg-gray-900 p-4 rounded w-11/12 sm:w-[720px] max-h-[80vh] overflow-auto">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Multiplicar: {multiplyingCell.name}</h4>

            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Nome da nova célula</label>
              <input value={newCellNameField} onChange={(e) => setNewCellNameField(e.target.value)} className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Líder da célula nova</label>
                <input value={newLeaderNameField} onChange={(e) => setNewLeaderNameField(e.target.value)} className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Líder da célula atual</label>
                <input value={oldLeaderNameField} onChange={(e) => setOldLeaderNameField(e.target.value)} className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" />
              </div>
            </div>

            <div className="mb-3">
              <div className="font-medium text-gray-900 dark:text-white mb-2">Selecionar membros para a nova célula</div>
              <div className="space-y-2 max-h-56 overflow-auto p-2 border rounded bg-white dark:bg-gray-800">
                {availableMembers.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">Nenhum membro disponível</div>}
                {availableMembers.map((m: any) => (
                  <label key={m.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedMemberIds.includes(m.id)} onChange={() => toggleMemberSelection(m.id)} />
                    <span className="text-sm text-gray-900 dark:text-white">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setMultiplyingCell(null)} className="px-3 py-1">Cancelar</button>
              <button onClick={submitMultiply} className="px-3 py-1 bg-indigo-600 text-white rounded">Multiplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* Acompanhamento agora é uma página separada */}
    </div>
  );
}
