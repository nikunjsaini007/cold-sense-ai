import { getJson } from './api.js';

export const getShipmentLocation = (shipmentId) => getJson(`/shipments/${encodeURIComponent(shipmentId)}/location`);
