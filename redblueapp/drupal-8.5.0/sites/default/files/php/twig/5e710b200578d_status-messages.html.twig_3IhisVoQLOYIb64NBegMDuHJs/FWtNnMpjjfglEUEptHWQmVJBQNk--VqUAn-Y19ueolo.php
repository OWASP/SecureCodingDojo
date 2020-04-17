<?php

/* @classy/misc/status-messages.html.twig */
class __TwigTemplate_59accd533e70f4d1c54f318bf02ba4ba1f2365cc34283e268db54ff5c097af40 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'messages' => array($this, 'block_messages'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $tags = array("block" => 24, "for" => 25, "set" => 27, "if" => 33);
        $filters = array("without" => 32, "length" => 39, "first" => 46);
        $functions = array();

        try {
            $this->env->getExtension('Twig_Extension_Sandbox')->checkSecurity(
                array('block', 'for', 'set', 'if'),
                array('without', 'length', 'first'),
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

        // line 24
        $this->displayBlock('messages', $context, $blocks);
    }

    public function block_messages($context, array $blocks = array())
    {
        // line 25
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable(($context["message_list"] ?? null));
        foreach ($context['_seq'] as $context["type"] => $context["messages"]) {
            // line 26
            echo "  ";
            // line 27
            $context["classes"] = array(0 => "messages", 1 => ("messages--" .             // line 29
$context["type"]));
            // line 32
            echo "  <div role=\"contentinfo\" aria-label=\"";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["status_headings"] ?? null), $context["type"], array(), "array"), "html", null, true));
            echo "\"";
            echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, twig_without($this->getAttribute(($context["attributes"] ?? null), "addClass", array(0 => ($context["classes"] ?? null)), "method"), "role", "aria-label"), "html", null, true));
            echo ">
    ";
            // line 33
            if (($context["type"] == "error")) {
                // line 34
                echo "      <div role=\"alert\">
    ";
            }
            // line 36
            echo "      ";
            if ($this->getAttribute(($context["status_headings"] ?? null), $context["type"], array(), "array")) {
                // line 37
                echo "        <h2 class=\"visually-hidden\">";
                echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->getAttribute(($context["status_headings"] ?? null), $context["type"], array(), "array"), "html", null, true));
                echo "</h2>
      ";
            }
            // line 39
            echo "      ";
            if ((twig_length_filter($this->env, $context["messages"]) > 1)) {
                // line 40
                echo "        <ul class=\"messages__list\">
          ";
                // line 41
                $context['_parent'] = $context;
                $context['_seq'] = twig_ensure_traversable($context["messages"]);
                foreach ($context['_seq'] as $context["_key"] => $context["message"]) {
                    // line 42
                    echo "            <li class=\"messages__item\">";
                    echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $context["message"], "html", null, true));
                    echo "</li>
          ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['message'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 44
                echo "        </ul>
      ";
            } else {
                // line 46
                echo "        ";
                echo $this->env->getExtension('Twig_Extension_Sandbox')->ensureToStringAllowed($this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, twig_first($this->env, $context["messages"]), "html", null, true));
                echo "
      ";
            }
            // line 48
            echo "    ";
            if (($context["type"] == "error")) {
                // line 49
                echo "      </div>
    ";
            }
            // line 51
            echo "  </div>
  ";
            // line 53
            echo "  ";
            $context["attributes"] = $this->getAttribute(($context["attributes"] ?? null), "removeClass", array(0 => ($context["classes"] ?? null)), "method");
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['type'], $context['messages'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
    }

    public function getTemplateName()
    {
        return "@classy/misc/status-messages.html.twig";
    }

    public function getDebugInfo()
    {
        return array (  120 => 53,  117 => 51,  113 => 49,  110 => 48,  104 => 46,  100 => 44,  91 => 42,  87 => 41,  84 => 40,  81 => 39,  75 => 37,  72 => 36,  68 => 34,  66 => 33,  59 => 32,  57 => 29,  56 => 27,  54 => 26,  50 => 25,  44 => 24,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "@classy/misc/status-messages.html.twig", "/Users/pauli/Workspace/hackday/drupal-8.5.0/core/themes/classy/templates/misc/status-messages.html.twig");
    }
}
