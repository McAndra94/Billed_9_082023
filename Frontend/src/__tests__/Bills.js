/**
 * @jest-environment jsdom
 */
//import { Router, navigate } from "@reach/router";

import {
	screen,
	waitFor,
	fireEvent,
	queryByAttribute,
} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
//import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
// import { formatDate, formatStatus } from "../app/format.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			//to-do write expect expression
			expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
		});

		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});

		// handleClickNewBill check
		test("Then I click on btn-new-bill, I should go to the new bill page", async () => {
			// Replacing localStorage with a mock version
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const btnNewBill = screen.getByTestId("btn-new-bill");
			btnNewBill.onclick = () => {
				window.location.hash = ROUTES_PATH["NewBill"];
			};
			btnNewBill.click();

			const billsIns = new Bills({
				document: document,
				onNavigate: jest.fn(),
			});

			billsIns.handleClickNewBill();
			expect(window.location.hash).toBe(ROUTES_PATH["NewBill"]);
		});

		test("Then I click on icon-eye, a modal should open", () => {
			const mockModal = jest.fn();
			global.$ = jest.fn().mockReturnValue({
				click: jest.fn(),
				modal: mockModal,
				find: jest.fn().mockReturnValue({
					html: jest.fn(),
				}),
				width: jest.fn(),
			});

			const mockBillUrl = "/proof.jpg";
			document.body.innerHTML = `
				<div data-testid="icon-eye" data-bill-url="${mockBillUrl}"></div>
				 <div class="modal fade" id="modaleFile">
				  <div class="modal-dialog">
					  <div class="modal-content">
						  <div class="modal-body"></div>
					  </div>
				  </div>
			  </div>
			`;

			const billsIns = new Bills({
				document: document,
				onNavigate: jest.fn(),
			});
			const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);

			billsIns.handleClickIconEye(iconEye);
			expect(mockModal).toHaveBeenCalledWith("show");
		});

		test("The number of bills should match the data", async () => {
			const billsIns = new Bills({
				document: document,
				onNavigate: jest.fn(),
				store: store,
			});

			const returnedBills = await billsIns.getBills();
			const expectedBills = bills;

			expect(returnedBills.length).toEqual(expectedBills.length);
		});
	});
});
