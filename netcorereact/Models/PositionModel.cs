using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;


namespace netcorereact.models
{
    public class PositionContext : DbContext
    {
        public PositionContext(DbContextOptions<PositionContext> options)
            : base(options)
        { }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Avatar> Avatars { get; set; }
    }

    public class Position
    {
        public string name { get; set; }
        public ICollection<Avatar> Avatar { get; set; }
    }

    public class Avatar 
    {
      public string id  { get; set; }

      public string direction  { get; set; }

      public int posX  { get; set; }

      public int posY  { get; set; }

    }
}