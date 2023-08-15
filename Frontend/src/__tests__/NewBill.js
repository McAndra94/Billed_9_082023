/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		test("Then... I can upload an image in jpg, jpeg or png format.", () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			//to-do write assertion

			// Get the file input
			const fileInput = screen.getByTestId("file");
			// Check it's "accept" attribute is set to only accept the 3 image formats
			expect(fileInput.getAttribute("accept")).toBe(".jpg, .jpeg, .png");

			/* 
			const newBill = new NewBill();
			const validExtensions = ["jpg", "jpeg", "png"];
			expect(validExtensions).toContain(fileExtension);
			 */
		});
	});
});
