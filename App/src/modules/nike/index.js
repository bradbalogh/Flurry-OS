import Functionality from "../../tasks/Functionality";

export default class extends Functionality {
  constructor(task, id) {
    super(task, id);

    this.setRunning(true);

    if (!this.invalidTask) this.updateStatus("Module Out of Service");
  }
}
