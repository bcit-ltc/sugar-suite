import { expect } from "chai";
import { JSDOM } from "jsdom";
import jquery from "jquery";

// Create a JSDOM instance and pass its window object to jQuery
const dom = new JSDOM();
const $ = jquery(dom.window);

// Test suite
describe("Table Column Alignment", function () {
    it("should apply alignment classes to table cells based on the first row", function () {
        // Mock HTML structure
        const dom = new JSDOM(`
            <table>
                <thead>
                    <tr>
                        <th class="left">Header 1</th>
                        <th class="center">Header 2</th>
                        <th class="right">Header 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Row 1 Col 1</td>
                        <td>Row 1 Col 2</td>
                        <td>Row 1 Col 3</td>
                    </tr>
                    <tr>
                        <td>Row 2 Col 1</td>
                        <td>Row 2 Col 2</td>
                        <td>Row 2 Col 3</td>
                    </tr>
                </tbody>
            </table>
        `);

        const window = dom.window;
        const document = window.document;
        const $table = $(document).find("table");

        // Simulate the alignment logic
        const $firstRowCells = $table.find("tr").first().children("td, th");
        const $alignedCells = $firstRowCells.filter(".left, .center, .centre, .right");

        $alignedCells.each(function () {
            const columnIndex = $(this).closest("tr").find("td, th").index($(this));
            const $rows = $table.find("tbody").children("tr");
            const columnClass = $(this).hasClass("left")
                ? "left"
                : $(this).hasClass("right")
                ? "right"
                : "center";

            $rows.each(function () {
                const $cell = $(this).find("td, th").eq(columnIndex);
                if (!$cell.is(".left, .center, .centre, .right")) {
                    $cell.addClass(columnClass);
                }
            });
        });

        // Assertions
        const $tbody = $table.find("tbody");
        expect($tbody.find("tr").eq(0).find("td").eq(0).hasClass("left")).to.be.true;
        expect($tbody.find("tr").eq(0).find("td").eq(1).hasClass("center")).to.be.true;
        expect($tbody.find("tr").eq(0).find("td").eq(2).hasClass("right")).to.be.true;
    });
});