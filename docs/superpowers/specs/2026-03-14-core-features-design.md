# Design Specification: Core Features & Unified Stock Ledger

## 1. Overview
This feature implements the core inventory movement operations (Receipts, Deliveries, Transfers, Adjustments) and transitions the system from a static `qty_on_hand` counter to a Unified Double-Entry Stock Ledger.

## 2. Database & Data Flow
### 2.1 The `stock_ledger` Table
The single source of truth for all inventory movements.
*   **id** (Primary Key)
*   **product_id** (Reference to Product)
*   **warehouse_id** (The location where stock changed)
*   **movement_type** (Enum: 'RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT')
*   **quantity** (Positive for incoming/additions, Negative for outgoing/reductions)
*   **reference_type** (Source table, e.g., 'receipts', 'deliveries')
*   **reference_id** (ID of the source document)
*   **created_at** (Timestamp)

### 2.2 Calculating Current Stock
*   A database view `current_stock_view` will sum the `quantity` from the `stock_ledger` for any given `product_id` and `warehouse_id`, representing the true stock on hand.

### 2.3 The Operations Tables
*   `receipts`, `deliveries`, `transfers`, and `adjustments` tables will track documents (Draft -> Done).
*   Stock only moves (a ledger entry is created) when the status changes to **Done** (Validated).

## 3. Backend Logic (Operations API)
When an operation is validated:
*   **Receipt (Incoming):** Insert row into `stock_ledger` (+Qty). Status -> 'Done'.
*   **Delivery (Outgoing):** Validate sufficient stock. Insert row into `stock_ledger` (-Qty). Status -> 'Done'.
*   **Transfer:** Insert TWO rows into `stock_ledger`: source warehouse (-Qty), destination warehouse (+Qty). Status -> 'Done'.
*   **Adjustment:** Calculate difference from counted vs. expected. Insert row into `stock_ledger` (+/- Qty). Status -> 'Done'.

## 4. Frontend Flow
*   **Product Management:** Add missing "Unit of Measure" field. Display stock from the `current_stock_view`.
*   **Operations Views:** Dedicated pages for Receipts, Deliveries, Transfers, and Adjustments.
*   **Operation Detail View:** Add products, quantities, and a **"Validate"** button to execute stock movement.
*   **Stock Ledger View:** A table showing movement history for full auditability.

## 5. Implementation Plan (Next Steps)
1.  **Database Migration:** Create `stock_ledger`, `current_stock_view`, and unbuilt operation tables.
2.  **Backend Routes/Controllers:** Implement endpoints for the 4 core operations and the ledger logic.
3.  **Frontend Pages:** Build the UI components for Operations and update Product Management.
4.  **Verification:** Test all flows (Receipt -> Transfer -> Delivery -> Adjustment) and verify ledger accuracy.
