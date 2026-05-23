'use client';

import { useEffect, useState } from 'react';
import {
  ensureInit, getClients, getLeads, getTickets,
  getStaff, getOrders, getDashboardStats, isUsingApi,
} from './mock-data';
import type { Client, Order, SalesLead, Ticket, Staff, DashboardStats } from '@/types';

export function useData() {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [useApi, setUseApi] = useState(false);

  function refresh() {
    setClients(getClients());
    setOrders(getOrders());
    setLeads(getLeads());
    setTickets(getTickets());
    setStaff(getStaff());
    setStats(getDashboardStats());
    setUseApi(isUsingApi());
  }

  useEffect(() => {
    ensureInit().then(() => {
      refresh();
      setReady(true);
    });
  }, []);

  return { ready, clients, orders, leads, tickets, staff, stats, useApi, refresh };
}
