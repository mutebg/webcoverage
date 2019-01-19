import { h, Component } from "preact";
import "./style";
const viewportsValues = ["375x667", "768x1024", "1280x960", "1400x960"];

class Form extends Component {
  handleOnSubmit = e => {
    e.preventDefault();

    const viewports = Array.from(
      document.querySelectorAll('[name="viewports"]:checked')
    ).map(el => el.value);

    const pages = document.querySelector('[name="pages"]').value;

    if (pages && viewports.length) {
      this.props.onSubmit({
        viewports,
        pages
      });
    } else {
      console.log("You need to select viewport and enter url");
    }
  };

  render({ params = {} }) {
    const { viewports = viewportsValues, pages = "" } = params;
    return (
      <div class="intro">
        <h1>WebCoverage.app</h1>
        <p>Find the amount of unused CSS & JSS on your page</p>
        <form onSubmit={this.handleOnSubmit}>
          <fieldset class="viewports">
            <legend>Select viewport:</legend>
            {viewportsValues.map(vp => (
              <div>
                <input
                  type="checkbox"
                  name="viewports"
                  id={`vp_${vp}`}
                  value={vp}
                  checked={viewports.includes(vp)}
                />
                <label for={`vp_${vp}`}>{vp}</label>
              </div>
            ))}
          </fieldset>
          <label>Enter URLs</label>
          <textarea name="pages" placeholder="Each URL on new line">
            {pages}
          </textarea>
          <button class="btn">Send</button>
        </form>
      </div>
    );
  }
}

export default Form;
