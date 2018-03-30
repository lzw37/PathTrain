using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(PathTrain.Startup))]
namespace PathTrain
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
