/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		beforeEach(() => {
			const html = NewBillUI();
			document.body.innerHTML = html;

			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
		});

		test("Then... I can upload an image with jpg, jpeg, png extensions.", async () => {
			// Get the file input
			const fileInput = screen.getByTestId("file");
			const testFile = "some file content";

			const newBillIns = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});
			const mockResponse = { fileUrl: "mockUrl", key: "mockKey" };
			newBillIns.store.bills().create = jest
				.fn()
				.mockResolvedValue(mockResponse);

			// create "blob" object to be able to have a file
			const blob = new Blob([testFile]);
			const mockFile = new File([blob], "sample.jpg", {
				type: "image/jpeg",
			});

			fireEvent.change(fileInput, { target: { files: [mockFile] } });

			await newBillIns.handleChangeFile({
				target: fileInput,
				preventDefault: jest.fn(),
			});

			// 1 file successfully attached
			expect(fileInput.files.length).toBe(1);

			// fileName matches
			expect(newBillIns.fileName).toBe("sample.jpg");
		});

		test("I can't upload files with invalid extensions.", async () => {
			const fileInput = screen.getByTestId("file");
			// Create a mock file with an invalid extension (.pdf)
			const testFile = "some file content";
			// create "blob" object to be able to have a file
			const blob = new Blob([testFile]);
			const mockFile = new File([blob], "sample.pdf", {
				type: "application/pdf",
			});

			const newBillIns = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Upload the file
			userEvent.upload(fileInput, mockFile);

			await newBillIns.handleChangeFile({
				target: fileInput,
				preventDefault: jest.fn(),
			});

			// Check if the file input's value was emptied, indicating the file was rejected
			expect(fileInput.value).toBe("");
		});

		test("Then handleSubmit function should be called on submit", () => {
			let newBillForm = screen.getByTestId("form-new-bill");
			const clone = newBillForm.cloneNode(true);
			newBillForm.parentNode.replaceChild(clone, newBillForm);
			newBillForm = clone;

			const newBillIns = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			const mockHandleSubmit = jest.fn();
			newBillIns.handleSubmit = mockHandleSubmit;

			newBillForm.addEventListener("submit", newBillIns.handleSubmit);

			fireEvent.submit(clone);

			expect(mockHandleSubmit).toHaveBeenCalled();
		});

		test("I can't submit the form if the date field is empty", () => {
			//const newBillForm = screen.getByTestId("form-new-bill");
			const datePicker = screen.getByTestId("datepicker");
			const submitButton = screen.getByText("Envoyer");

			const newBillIns = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Spy on handleSubmit to check if it's called
			jest.spyOn(newBillIns, "handleSubmit");

			userEvent.clear(datePicker);

			// Stimulate submit click with empty date field
			fireEvent.click(submitButton);

			console.log(datePicker, "submitButton clicked with empty date field");
			expect(newBillIns.handleSubmit).not.toHaveBeenCalled();
		});
	});
});
