import { defineComponent, PropType, html } from "./index";
import {repeat} from 'lit-html/directives/repeat'
import {classMap} from "lit-html/directives/class-map";

defineComponent('xasd-xsad', {
  person: {
    type: String as unknown as PropType<{ name: string }>,
  }
}, (props, context) => {

  return () => html`
    <div class="${classMap({selected: true})}"></div>
    
  ${repeat([1,2,3], (item) => item, item => html`<li></li>`)}
  ${[1,2,3].map(item => html`<li></li>`)}
  `
})