using System;
using System.Collections.Generic;

namespace netcorereact.containers {

  class CanvasObjects {
      public List<CanvasObject> Objs { get; set; }
  }

  class CanvasObject {
    public string direction { get; set; }
  }

  class PositionTracker {
      public string key { get; set; }
      public CanvasObjects message { get; set; }
  }
}