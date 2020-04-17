<?php

/* core/themes/classy/templates/form/form-element.html.twig */
class __TwigTemplate_c1b0dc1db824b50c20b0a69e9a06081882039643c0740c44451d14fd9e353519 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $tags = array("set" => 48, "if" => 67);
        $filters = array("clean_class" => 51);
        $functions = array();

        try {
            $this->env->getExtension('Twig_Extension_Sandbox')->checkSecurity(
                array('set', 'if'),
                array('clean_class'),
                array()
            );
        } catch (Twig_Sandbox_SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof Twig_Sandbox_SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof Twig_Sandbox_SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof Twig_Sandbox_SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

        // line 48
        $context["classes"] = array(0 => "js-form-item", 1 => "form-item", 2 => ("js-form-type-" . \Drupal\Component\Utility\Html::getClass(        // line 51
($context["type"] ?? null))), 3 => ("form-type-" . \Drupal\Component\Utility\Html::getClass(        // line 52
($context["type"] ?? null))), 4 => ("js-form-item-" . \Drupal\Component\Utility\Html::getClass(        // line 53
($context["name"] ?? null))), 5 => ("form-item-" . \Drupal\Component\Utility\Html::getClass(        // line 54
($context["name"] ?? null))), 6 => ((!twig_in_filter(        // line 55
($context["title_display"] ?? null), array(0 => "after", 1 => "before"))) ? ("form-no-label") : ("")), 7 => (((        // line 56
($context["disabled"] ?? null) == "disabled")) ? ("form-disabled") : ("")), 8 => ((        // line 57
($context["errors"] ?? null)) ? ("form-item--error") : ("")));
        // line 61
        $context["description_classes"] = array(0 => "description", 1 => (((        // line 63
($context["description_display"] ?? null) == "invisible")) ? ("visually-hidden") : ("")));
        // line 66
        echo "<div";
        echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["attributes"] ?? null), "addClass", array(0 => ($context["classes"] ?? null)), "method"), "html", null, true));
        echo ">
  ";
        // line 67
        if (twig_in_filter(($context["label_display"] ?? null), array(0 => "before", 1 => "invisible"))) {
            // line 68
            echo "    ";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["label"] ?? null), "html", null, true));
            echo "
  ";
        }
        // line 70
        echo "  ";
        if ( !twig_test_empty(($context["prefix"] ?? null))) {
            // line 71
            echo "    <span class=\"field-prefix\">";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["prefix"] ?? null), "html", null, true));
            echo "</span>
  ";
        }
        // line 73
        echo "  ";
        if (((($context["description_display"] ?? null) == "before") && $this->getAttribute(($context["description"] ?? null), "content", array()))) {
            // line 74
            echo "    <div";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["description"] ?? null), "attributes", array()), "html", null, true));
            echo ">
      ";
            // line 75
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["description"] ?? null), "content", array()), "html", null, true));
            echo "
    </div>
  ";
        }
        // line 78
        echo "  ";
        echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["children"] ?? null), "html", null, true));
        echo "
  ";
        // line 79
        if ( !twig_test_empty(($context["suffix"] ?? null))) {
            // line 80
            echo "    <span class=\"field-suffix\">";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["suffix"] ?? null), "html", null, true));
            echo "</span>
  ";
        }
        // line 82
        echo "  ";
        if ((($context["label_display"] ?? null) == "after")) {
            // line 83
            echo "    ";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["label"] ?? null), "html", null, true));
            echo "
  ";
        }
        // line 85
        echo "  ";
        if (($context["errors"] ?? null)) {
            // line 86
            echo "    <div class=\"form-item--error-message\">
      <strong>";
            // line 87
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($context["errors"] ?? null), "html", null, true));
            echo "</strong>
    </div>
  ";
        }
        // line 90
        echo "  ";
        if ((twig_in_filter(($context["description_display"] ?? null), array(0 => "after", 1 => "invisible")) && $this->getAttribute(($context["description"] ?? null), "content", array()))) {
            // line 91
            echo "    <div";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute($this->getAttribute(($context["description"] ?? null), "attributes", array()), "addClass", array(0 => ($context["description_classes"] ?? null)), "method"), "html", null, true));
            echo ">
      ";
            // line 92
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["description"] ?? null), "content", array()), "html", null, true));
            echo "
    </div>
  ";
        }
        // line 95
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "core/themes/classy/templates/form/form-element.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  139 => 95,  133 => 92,  128 => 91,  125 => 90,  119 => 87,  116 => 86,  113 => 85,  107 => 83,  104 => 82,  98 => 80,  96 => 79,  91 => 78,  85 => 75,  80 => 74,  77 => 73,  71 => 71,  68 => 70,  62 => 68,  60 => 67,  55 => 66,  53 => 63,  52 => 61,  50 => 57,  49 => 56,  48 => 55,  47 => 54,  46 => 53,  45 => 52,  44 => 51,  43 => 48,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "core/themes/classy/templates/form/form-element.html.twig", "/Users/pauli/Workspace/hackday/drupal-8.5.0/core/themes/classy/templates/form/form-element.html.twig");
    }
}
