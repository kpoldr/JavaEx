package conf;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

public class Initializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[0];
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[] { MvcConfig.class };
    }

    @Override
//    @CrossOrigin
    protected String[] getServletMappings() {
        return new String[] {"/api/*"};
    }

}