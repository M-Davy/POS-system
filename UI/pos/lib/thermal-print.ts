export type ThermalPrinterSettings = {
  enabled: boolean;
  printerName: string;
  paperWidth: "58" | "80";
  fallbackToBrowser: boolean;
};

export type ReceiptLineItem = {
  name: string;
  qty: number;
  type?: string;
  total: number;
};

export type ReceiptPayload = {
  storeName: string;
  tagline: string;
  location: string;
  printedAt: Date;
  receiptNo: string;
  items: ReceiptLineItem[];
  subtotal: number;
  amountPaid: number;
  change: number;
  grandTotal: number;
  paymentMethod: string;
  phone?: string;
  cashierName: string;
};

export const defaultThermalPrinterSettings: ThermalPrinterSettings = {
  enabled: false,
  printerName: "",
  paperWidth: "80",
  fallbackToBrowser: true,
};

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 2)}..` : value;

const formatMoney = (value: number) => `Ksh ${value.toFixed(2)}`;

const centerLine = (text: string, width: number) => {
  if (text.length >= width) return text;
  const leftPadding = Math.floor((width - text.length) / 2);
  return `${" ".repeat(leftPadding)}${text}`;
};

const toDivider = (width: number) => "-".repeat(width);

export const buildThermalReceiptText = (
  payload: ReceiptPayload,
  paperWidth: "58" | "80",
) => {
  const lineWidth = paperWidth === "58" ? 32 : 42;
  const itemNameWidth = paperWidth === "58" ? 16 : 22;
  const qtyWidth = paperWidth === "58" ? 6 : 8;
  const totalWidth = lineWidth - itemNameWidth - qtyWidth;

  const rows = payload.items
    .map((item) => {
      const qtyLabel = `${item.qty}${item.type === "WEIGHED" ? "kg" : ""}`;
      const itemName = truncate(item.name, itemNameWidth);
      const qty = truncate(qtyLabel, qtyWidth).padEnd(qtyWidth);
      const total = item.total.toFixed(2).padStart(totalWidth);
      return `${itemName.padEnd(itemNameWidth)}${qty}${total}`;
    })
    .join("\n");

  const lines = [
    centerLine(payload.storeName, lineWidth),
    centerLine(payload.tagline, lineWidth),
    centerLine(payload.location, lineWidth),
    centerLine(payload.printedAt.toLocaleString(), lineWidth),
    centerLine(`Receipt #: ${payload.receiptNo}`, lineWidth),
    toDivider(lineWidth),
    `${"ITEM".padEnd(itemNameWidth)}${"QTY".padEnd(qtyWidth)}${"TOTAL".padStart(totalWidth)}`,
    rows,
    toDivider(lineWidth),
    `${"Subtotal:".padEnd(lineWidth - 12)}${formatMoney(payload.subtotal).padStart(12)}`,
    `${"Amount Paid:".padEnd(lineWidth - 12)}${formatMoney(payload.amountPaid).padStart(12)}`,
    payload.change > 0
      ? `${"Change:".padEnd(lineWidth - 12)}${formatMoney(payload.change).padStart(12)}`
      : "",
    toDivider(lineWidth),
    `${"GRAND TOTAL".padEnd(lineWidth - 12)}${formatMoney(payload.grandTotal).padStart(12)}`,
    toDivider(lineWidth),
    centerLine(`Payment: ${payload.paymentMethod.toUpperCase()}`, lineWidth),
    payload.phone ? centerLine(`Phone: ${payload.phone}`, lineWidth) : "",
    centerLine("THANK YOU FOR YOUR PATRONAGE", lineWidth),
    centerLine(`Items: ${payload.items.length} | Cashier: ${payload.cashierName}`, lineWidth),
    "\n\n\n",
  ].filter(Boolean);

  // ESC/POS full cut command appended at the end where supported.
  return `${lines.join("\n")}\x1D\x56\x00`;
};

const getQzModule = async () => {
  const imported = await import("qz-tray");
  return (imported as any).default || imported;
};

export const printWithThermalPrinter = async (
  payload: ReceiptPayload,
  settings: ThermalPrinterSettings,
) => {
  if (!settings.printerName.trim()) {
    throw new Error("Thermal printer name is required for direct printing.");
  }

  const qz = await getQzModule();

  qz.security.setCertificatePromise(() => Promise.resolve(""));
  qz.security.setSignaturePromise(() => Promise.resolve(""));

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect({ retries: 1, delay: 0 });
  }

  const config = qz.configs.create(settings.printerName.trim(), {
    copies: 1,
    jobName: "ESIT Receipt",
  });

  const data = [
    {
      type: "raw",
      format: "plain",
      data: buildThermalReceiptText(payload, settings.paperWidth),
    },
  ];

  await qz.print(config, data);
};
