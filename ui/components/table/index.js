import { h, Component } from "preact";
import "./style";

const Table = ({ rows = [] }) => {
  if (rows.length === 0) {
    return null;
  }

  return (
    <table class="data-grid">
      <tr class="">
        <th class="" style="width: auto;">
          URL
        </th>
        <th class="" style="width: 45px;">
          Type
        </th>
        <th class="" style="width: 80px;">
          Total bytes
        </th>
        <th class="" style="width: 120px;">
          Unused bytes
        </th>
        <th class="" style="width: 200px;" />
      </tr>
      {rows.map(
        ({
          url,
          type,
          totalBytes,
          unusedBytesTotal,
          unusedPercent,
          usedPercent
        }) => (
          <tr>
            <td class="url">{url}</td>
            <td class="type">{type}</td>
            <td class="totalBytes">{totalBytes}</td>
            <td class="unusedBytesTotal">
              <span>{unusedBytesTotal}</span>
              <span class="percent-value"> ( {unusedPercent} )</span>
            </td>
            <td class="bars">
              <div class="bar-container">
                <div
                  class="bar bar-unused-size"
                  style={{ width: unusedPercent + "%" }}
                />
                <div
                  class="bar bar-used-size"
                  style={{ width: usedPercent + "%" }}
                />
              </div>
            </td>
          </tr>
        )
      )}
    </table>
  );
};
export default Table;
